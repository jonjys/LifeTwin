"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Bell, Clock3, PiggyBank, Tag } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { EASE } from "@/lib/motion";
import type { NotificationKind, SmartNotification } from "@/lib/types";

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  "price-drop": Tag,
  "wait-recommendation": Clock3,
  "campaign-start": Tag,
  "usual-cart-cheaper": PiggyBank,
};

type NotificationsFeedProps = {
  notifications: SmartNotification[];
};

/** Not spam — every line here is a real-money reason to open the app. */
export const NotificationsFeed = memo(function NotificationsFeed({
  notifications,
}: NotificationsFeedProps) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Bell className="size-4 text-primary" />
        <CardTitle>Bevakning</CardTitle>
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
