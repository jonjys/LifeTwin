"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, BellRing, Clock3, PiggyBank, Tag } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import {
  getNotificationPermission,
  notifyNewSmartNotifications,
  requestNotificationPermission,
} from "@/lib/notifications/browser-notifications";
import type { NotificationKind, SmartNotification } from "@/lib/types";
import { todayKey } from "@/lib/utils";

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  "price-drop": Tag,
  "wait-recommendation": Clock3,
  "campaign-start": Tag,
  "usual-cart-cheaper": PiggyBank,
};

type NotificationsFeedProps = {
  notifications: SmartNotification[];
};

/** Not spam — every line here is a real-money reason to open the app.
 *  Also offers to mirror it as a real browser notification (the
 *  Notification API, not a fake toast) — foreground-only, since there's
 *  no push backend here to wake a closed tab. */
export const NotificationsFeed = memo(function NotificationsFeed({
  notifications,
}: NotificationsFeedProps) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    if (permission === "granted" && notifications.length > 0) {
      notifyNewSmartNotifications(notifications, todayKey());
    }
  }, [permission, notifications]);

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") notifyNewSmartNotifications(notifications, todayKey());
  };

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bell className="size-4 text-primary" />
          <CardTitle>Bevakning</CardTitle>
        </div>
        {permission === "default" && (
          <button
            type="button"
            onClick={handleEnable}
            className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:border-primary/50"
          >
            <BellRing className="size-3" />
            Aktivera riktiga notiser
          </button>
        )}
        {permission === "granted" && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-success">
            <BellRing className="size-3" />
            Notiser på
          </span>
        )}
        {permission === "denied" && (
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <BellOff className="size-3" />
            Blockerat i webbläsaren
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {notifications.map((notification, i) => {
          const Icon = KIND_ICON[notification.kind];
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 * i, ease: EASE }}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface-2/50 p-3.5"
            >
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-3.5" />
              </div>
              <p className="text-sm leading-relaxed text-ink-secondary">
                {notification.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
});
