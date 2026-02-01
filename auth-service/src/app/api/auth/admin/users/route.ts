import { auth, db } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { user, session, auditLog } from "@/lib/db/schema";
import { eq, and, or, sql, desc, asc, gte, isNull, inArray, InferSelectModel } from "drizzle-orm";
import { checkAccountLockoutBatch, MAX_FAILED_ATTEMPTS } from "@/lib/security/account-lockout";

type User = InferSelectModel<typeof user>;

/**
 * Escapes SQL LIKE pattern special characters (%, _, \)
 * @param pattern - The search pattern to escape
 * @returns The escaped pattern safe for use in LIKE queries
 */
function escapeLikePattern(pattern: string): string {
  return pattern.replace(/([%_\\])/g, "\\$1");
}

/**
 * Creates a safe LIKE condition with ESCAPE clause
 * @param column - The database column to search
 * @param pattern - The search pattern (will be escaped and wrapped with %)
 * @returns A SQL fragment with LIKE and ESCAPE clause
 */
function safeLike(column: any, pattern: string) {
  const escaped = escapeLikePattern(pattern);
  return sql`${column} LIKE ${`%${escaped}%`} ESCAPE '\\'`;
}
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const sessionResult = await auth.api.getSession({
      headers: { cookie: cookieHeader },
    });

    if (!sessionResult || !sessionResult.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const currentUser = sessionResult.user;
    const currentUserRole = (currentUser as any).role;

    if (currentUserRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can access this endpoint" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const emailVerified = searchParams.get("emailVerified");
    const locked = searchParams.get("locked");
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    
    // Validate and bound pagination parameters
    const pageParam = searchParams.get("page") || "1";
    const limitParam = searchParams.get("limit") || "20";
    let page = parseInt(pageParam, 10);
    let limit = parseInt(limitParam, 10);
    
    // Handle NaN cases - fall back to defaults
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1) {
      limit = 20;
    }
    
    // Clamp limit to reasonable range (1-100) to prevent resource exhaustion
    if (limit > 100) {
      limit = 100;
    }
    
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDirection = searchParams.get("sortDirection") || "desc";

    // If locked filter is present, we need to fetch ALL users to filter correctly
    // since lockout status is computed, not stored in the database
    const hasLockedFilter = locked !== null && locked !== undefined;
    const offset = (page - 1) * limit;
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          safeLike(user.email, search),
          safeLike(sql`COALESCE(${user.username}, '')`, search),
          safeLike(sql`COALESCE(${user.name}, '')`, search)
        )!
      );
    }

    if (role && ["CUSTOMER", "ADMIN"].includes(role)) {
      conditions.push(eq(user.role, role));
    }

    if (emailVerified !== null && emailVerified !== undefined) {
      conditions.push(eq(user.emailVerified, emailVerified === "true"));
    }
    if (!includeDeleted) {
      conditions.push(isNull(user.deletedAt));
    }

    let query = db.select().from(user);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(totalCountResult[0]?.count || 0);

    const validSortFields: Record<string, any> = {
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      name: user.name,
    };
    const sortField = validSortFields[sortBy] || user.createdAt;
    const orderBy =
      sortDirection === "asc" ? asc(sortField) : desc(sortField);

    // Get users - fetch ALL if locked filter is present (for accurate pagination)
    // Otherwise use normal pagination
    const users: User[] = hasLockedFilter
      ? await (query.orderBy(orderBy) as unknown as Promise<User[]>)
      : await (query.orderBy(orderBy).limit(limit).offset(offset) as unknown as Promise<User[]>);

    if (users.length === 0) {
      return NextResponse.json({
        users: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    const userIds = users.map((u) => u.id);
    const now = new Date();

    // Batch query: Get session counts for all users in one query
    const sessionCountsResult = await db
      .select({
        userId: session.userId,
        count: sql<number>`count(*)`,
      })
      .from(session)
      .where(
        and(
          inArray(session.userId, userIds),
          gte(session.expiresAt, now)
        )
      )
      .groupBy(session.userId);

    const sessionCountMap = new Map<string, number>();
    sessionCountsResult.forEach((row) => {
      sessionCountMap.set(row.userId, Number(row.count || 0));
    });

    // Batch query: Get last login for all users
    // Use a window function approach or subquery to get the most recent login per user
    const lastLoginsResult = await db
      .select({
        userId: auditLog.userId,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .where(
        and(
          inArray(auditLog.userId, userIds),
          eq(auditLog.eventType, "login"),
          eq(auditLog.success, true)
        )
      )
      .orderBy(desc(auditLog.createdAt));

    // Group by userId and take the first (most recent) for each user
    const lastLoginMap = new Map<string, Date>();
    const seenUserIds = new Set<string>();
    lastLoginsResult.forEach((row) => {
      if (row.userId && !seenUserIds.has(row.userId)) {
        lastLoginMap.set(row.userId, row.createdAt);
        seenUserIds.add(row.userId);
      }
    });

    // Batch check lockout status for all users
    const lockoutStatusMap = await checkAccountLockoutBatch(
      users.map((u) => ({ id: u.id, email: u.email }))
    );

    // Enrich users with batched data and lockout status
    const enrichedUsers = users.map((u) => {
      const lockoutStatus = lockoutStatusMap.get(u.id) || {
        isLocked: false,
        remainingAttempts: MAX_FAILED_ATTEMPTS,
      };
      const sessionCount = sessionCountMap.get(u.id) || 0;
      const lastLogin = lastLoginMap.get(u.id) || null;

      return {
        id: u.id,
        deletedAt: u.deletedAt,
        isDeleted: !!u.deletedAt,
        email: u.email,
        name: u.name,
        username: u.username,
        displayUsername: u.displayUsername,
        role: u.role || "CUSTOMER",
        locale: u.locale || "en",
        emailVerified: u.emailVerified,
        image: u.image,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        isLocked: lockoutStatus.isLocked,
        sessionCount,
        lastLogin: lastLogin ? lastLogin.toISOString() : null,
      };
    });

    // Apply locked filter if present (we fetched ALL users, so we can filter and paginate correctly)
    if (hasLockedFilter) {
      const isLocked = locked === "true";
      const allFilteredUsers = enrichedUsers.filter((u) => u.isLocked === isLocked);
      
      // Calculate correct pagination from filtered results
      const filteredTotal = allFilteredUsers.length;
      const filteredTotalPages = Math.ceil(filteredTotal / limit);
      
      // Slice to the requested page
      const paginatedUsers = allFilteredUsers.slice(offset, offset + limit);
      
      return NextResponse.json({
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredTotal,
          totalPages: filteredTotalPages,
        },
      });
    }

    // No locked filter - use original pagination
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching users:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

