"use client";

import { RiUserForbidFill } from "@repo/ui/icon";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryStates } from "nuqs";
import * as React from "react";

import { ConfirmationDialog } from "@repo/ui/custom/confirmation-dialog";
import {
  Island,
  IslandBadge,
  IslandContent,
  IslandDivider,
  IslandKbdButton,
} from "@repo/ui/island";
import { IslandDeselect } from "@repo/ui/island/island-deselect";
import { TableEmptyState } from "@repo/ui/table/empty-state";
import { TableLoadingSkeleton } from "@repo/ui/table/loading-skeleton";
import { TablePagination } from "@repo/ui/table/pagination";
import { IllustrationEmptyEmployeeSpotlight } from "@repo/ui/illustrations";
import * as Table from "@repo/ui/base-table";
import { useIslandShortcuts } from "@repo/ui/hooks/use-island-shortcuts";
import { cn } from "@repo/ui/utils/cn";
import { handleSortingChange, queryParamsToSortingState } from "@repo/ui/table";
import { orpc } from "@/orpc/client";

import { useBatchUserActions } from "../_hooks/use-batch-user-actions";
import { adminUsersParsers, type SortableColumn } from "../search-params";
import { getUsersColumns, type User } from "./columns";

export function UsersTable() {
  const [showBanDialog, setShowBanDialog] = React.useState(false);
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);

  const [
    { search, role, waitlistStatus, sortBy, sortOrder, page, limit },
    setQueryStates,
  ] = useQueryStates(adminUsersParsers);

  const setSortBy = React.useCallback(
    (value: SortableColumn | null) => {
      setQueryStates({ sortBy: value });
    },
    [setQueryStates],
  );
  const setSortOrder = React.useCallback(
    (value: "asc" | "desc" | null) => {
      setQueryStates({ sortOrder: value });
    },
    [setQueryStates],
  );
  const setPage = React.useCallback(
    (value: number | null) => {
      setQueryStates({ page: value });
    },
    [setQueryStates],
  );
  const setLimit = React.useCallback(
    (value: number | null) => {
      setQueryStates({ limit: value });
    },
    [setQueryStates],
  );

  const { banMultipleUsers } = useBatchUserActions();

  const { data, isLoading } = useQuery(
    orpc.auth.listUsers.queryOptions({
      input: {
        page,
        limit,
        sortBy: sortBy as SortableColumn,
        sortOrder,
        search,
        role,
        waitlistStatus,
      },
      placeholderData: keepPreviousData,
    }),
  );

  const tableSorting = React.useMemo<SortingState>(
    () => queryParamsToSortingState(sortBy, sortOrder),
    [sortBy, sortOrder],
  );

  const columns = React.useMemo(() => getUsersColumns(), []);

  const tableData = React.useMemo(() => {
    return isLoading ? [] : (data?.data ?? []);
  }, [data?.data, isLoading]);

  const table = useReactTable<User>({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    onSortingChange: (updaterOrValue) => {
      handleSortingChange<SortableColumn>({
        updaterOrValue,
        currentSorting: tableSorting,
        setSortBy,
        setSortOrder,
        setPage,
        currentPage: page,
      });
    },
    state: {
      sorting: tableSorting,
    },
  });

  const handleBan = React.useCallback(() => {
    const selectedUsers = table
      .getSelectedRowModel()
      .rows.map((row) => row.original) as User[];

    if (selectedUsers.length === 0) {
      return;
    }

    setSelectedUserIds(selectedUsers.map((user) => user.id));
    setShowBanDialog(true);
  }, [table]);

  const handleConfirmBan = React.useCallback(() => {
    if (selectedUserIds.length === 0) {
      return;
    }

    banMultipleUsers(selectedUserIds);
    table.resetRowSelection();
    setShowBanDialog(false);
  }, [banMultipleUsers, selectedUserIds, table]);

  const { shortcutComponents } = useIslandShortcuts(
    [
      {
        key: "b",
        label: "Ban",
        action: handleBan,
        displayKey: "B",
      },
    ],
    {
      enabled: table.getSelectedRowModel().rows.length > 0,
      onEscapeKey: () => table.resetRowSelection(),
    },
  );

  return (
    <>
      <Table.Root className="-mx-4 w-auto px-4 lg:mx-0 lg:w-full lg:px-0 [&>table]:min-w-215">
        <Table.Header className="whitespace-nowrap">
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Table.Head
                    className={cn(
                      header.column.columnDef.meta?.className as string,
                    )}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </Table.Head>
                );
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {isLoading && <TableLoadingSkeleton columnLength={columns.length} />}
          {!isLoading &&
            table.getRowModel().rows?.length > 0 &&
            table.getRowModel().rows.map((row, i, arr) => (
              <React.Fragment key={row.id}>
                <Table.Row data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell
                      className={cn(
                        cell.column.columnDef.meta?.className as string,
                      )}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
                {i < arr.length - 1 && <Table.RowDivider />}
              </React.Fragment>
            ))}
          {!isLoading && table.getRowModel().rows?.length === 0 && (
            <Table.Row>
              <Table.Cell
                className="h-72 text-center group-hover/row:bg-transparent"
                colSpan={columns.length}
              >
                <TableEmptyState
                  description="Please try again."
                  icon={
                    <IllustrationEmptyEmployeeSpotlight className="size-27" />
                  }
                  title="No users found for this search."
                />
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>

      {data?.pagination && (
        <TablePagination
          itemName="users"
          limit={limit}
          onLimitChange={setLimit}
          onPageChange={setPage}
          page={page}
          pagination={data.pagination}
        />
      )}

      {/* Selection Island */}
      <Island
        count={table.getSelectedRowModel().rows.length}
        show={table.getSelectedRowModel().rows.length > 0}
      >
        <IslandContent>
          <IslandBadge />
          {shortcutComponents.map((shortcutComponent) => (
            <React.Fragment key={shortcutComponent.key}>
              <IslandDivider />
              <IslandKbdButton
                label={shortcutComponent.label}
                onClick={shortcutComponent.onClick}
                shortcut={shortcutComponent.shortcut}
              />
            </React.Fragment>
          ))}
          <IslandDeselect onDeselect={() => table.resetRowSelection()} />
        </IslandContent>
      </Island>

      {/* Ban Confirmation Dialog */}
      <ConfirmationDialog
        cancelText="Cancel"
        confirmText="Ban User"
        description={
          selectedUserIds.length === 1
            ? `Are you sure you want to ban ${table.getRowModel().rows.find((row) => (row.original as User).id === selectedUserIds[0])?.original.email || ""}? This will prevent the user from logging in.`
            : `Are you sure you want to ban ${selectedUserIds.length} users? This will prevent them from logging in.`
        }
        icon={RiUserForbidFill}
        onConfirm={handleConfirmBan}
        onOpenChange={setShowBanDialog}
        open={showBanDialog}
        title="Ban User"
        variant="danger"
      />
    </>
  );
}
