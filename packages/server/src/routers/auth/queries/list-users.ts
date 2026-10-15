import { and, asc, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";

import { user } from "@repo/database";
import { adminProcedure } from "../../../procedure/admin.procedure";
import { listUsersSchema } from "../validators";
import { paginateResults } from "../../../utils/paginate-results";

export const listUsersBase = adminProcedure
  .meta({ roles: ["admin"] })
  .input(listUsersSchema);

export const listUsersHandler = listUsersBase.handler(
  async ({ input, context }) => {
    const { db } = context;

    const filters: SQL[] = [];

    if (input.search) {
      const pattern = `%${input.search}%`;
      const searchCondition = or(
        ilike(user.name, pattern),
        ilike(user.email, pattern),
      );
      if (searchCondition) {
        filters.push(searchCondition);
      }
    }

    if (input.role && input.role !== "all") {
      filters.push(eq(user.role, input.role));
    }

    const whereCondition = filters.length > 0 ? and(...filters) : undefined;

    const sortDirection = input.sortOrder === "asc" ? asc : desc;
    let sortColumn: typeof user.name | typeof user.role | typeof user.createdAt;
    switch (input.sortBy) {
      case "user":
        sortColumn = user.name;
        break;
      case "role":
        sortColumn = user.role;
        break;
      default:
        sortColumn = user.createdAt;
        break;
    }

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereCondition ?? sql`true`);

    const total = countResult?.count ?? 0;

    const users = await db
      .select({ user })
      .from(user)
      .where(whereCondition ?? sql`true`)
      .orderBy(sortDirection(sortColumn))
      .offset((input.page - 1) * input.limit)
      .limit(input.limit);

    return paginateResults({ data: users.map((u) => u.user), total, input });
  },
);
