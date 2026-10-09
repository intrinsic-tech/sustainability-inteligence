"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, Trash2, X } from "lucide-react";
import {
  deleteUser,
  listUsers,
  setUserPermission,
  type ManagedUser,
  type UsersErrorCode,
} from "@/app/actions/users";
import type { Permission } from "@/lib/auth/permissions";
import { format, useTranslations } from "@/i18n";

// Pending requests first, then everyone else alphabetically (as returned by the server).
const permissionOrder: Record<Permission, number> = { pending: 0, approved: 1, rejected: 2 };

const statusClass: Record<Permission, string> = {
  approved: "status-verified",
  pending: "status-review",
  rejected: "status-rejected",
};

export function UserApprovals({
  currentUserId,
  onPendingChange,
}: {
  currentUserId: string;
  onPendingChange: (count: number) => void;
}) {
  const router = useRouter();
  const sectionTitle = useTranslations("dashboard").sections.approvals;
  const t = useTranslations("dashboard").approvals;
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState<UsersErrorCode | null>(null);
  const [busyId, setBusyId] = useState<ManagedUser["id"] | null>(null);
  const [loading, startLoading] = useTransition();

  function apply(result: Awaited<ReturnType<typeof listUsers>>) {
    if (!result.ok) {
      if (result.error === "unauthorized") return router.refresh();
      setError(result.error);
      return;
    }
    const sorted = [...result.data].sort(
      (a, b) => permissionOrder[a.permission] - permissionOrder[b.permission],
    );
    setUsers(sorted);
    onPendingChange(sorted.filter((user) => user.permission === "pending").length);
  }

  function load() {
    setError(null);
    startLoading(async () => apply(await listUsers()));
  }

  // Load once when the section opens.
  useEffect(() => {
    let active = true;
    listUsers().then((result) => {
      if (active) apply(result);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(user: ManagedUser, action: () => Promise<{ ok: boolean; error?: UsersErrorCode }>) {
    setBusyId(user.id);
    setError(null);
    const result = await action();
    setBusyId(null);
    if (!result.ok) {
      setError(result.error ?? "server_error");
      return;
    }
    load();
  }

  function handleRemove(user: ManagedUser) {
    if (!window.confirm(format(t.confirmRemove, { name: user.name }))) return;
    void run(user, () => deleteUser(user.id));
  }

  return (
    <>
      <div className="section-heading-row">
        <div className="section-heading">
          <h1>{sectionTitle}</h1>
          <p>{t.description}</p>
        </div>
        <button className="button-secondary" onClick={load} disabled={loading}>
          <RefreshCw size={16} /> {t.refresh}
        </button>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {t.errors[error]}
        </p>
      )}
      <div className="content-panel">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.columns.name}</th>
                <th>{t.columns.email}</th>
                <th>{t.columns.role}</th>
                <th>{t.columns.status}</th>
                <th>
                  <span className="sr-only">{t.columns.actions}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => {
                const isSelf = String(user.id) === currentUserId;
                const busy = busyId === user.id;
                return (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                      {isSelf && <span className="user-self"> {t.you}</span>}
                    </td>
                    <td>{user.email}</td>
                    <td>{t.roles[user.role as keyof typeof t.roles] ?? user.role}</td>
                    <td>
                      <span className={`status-pill ${statusClass[user.permission] ?? "status-review"}`}>
                        <span />
                        {t.status[user.permission] ?? user.permission}
                      </span>
                    </td>
                    <td>
                      {!isSelf && (
                        <div className="user-actions">
                          {user.permission !== "approved" && (
                            <button
                              className="button-primary"
                              disabled={busy}
                              onClick={() => run(user, () => setUserPermission(user.id, "approved"))}
                            >
                              <Check size={15} /> {t.approve}
                            </button>
                          )}
                          {user.permission !== "rejected" && (
                            <button
                              className="button-secondary"
                              disabled={busy}
                              onClick={() => run(user, () => setUserPermission(user.id, "rejected"))}
                            >
                              <X size={15} /> {t.reject}
                            </button>
                          )}
                          <button
                            className="row-arrow user-remove"
                            disabled={busy}
                            aria-label={format(t.remove, { name: user.name })}
                            title={format(t.remove, { name: user.name })}
                            onClick={() => handleRemove(user)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users?.length === 0 && (
                <tr>
                  <td colSpan={5}>{t.empty}</td>
                </tr>
              )}
              {!users && (
                <tr>
                  <td colSpan={5}>{t.loading}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
