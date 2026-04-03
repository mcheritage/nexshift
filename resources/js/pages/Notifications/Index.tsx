import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Notification } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Notifications', href: '/notifications' },
];

interface Props {
    notifications: Notification[];
    unread_count: number;
}

function getNotificationUrl(notification: Notification): string {
    const data = notification.data ?? {};
    switch (notification.type) {
        case 'payment_received':
            return data.invoice_id ? route('invoices.show', data.invoice_id) : route('invoices.index');
        case 'timesheet_submitted':
        case 'timesheet_approved':
        case 'timesheet_rejected':
        case 'timesheet_queried':
            return data.timesheet_id ? route('timesheets.show', data.timesheet_id) : route('timesheets.index');
        case 'shift_application':
        case 'application_accepted':
        case 'application_rejected':
            return data.shift_id ? route('shifts.show', data.shift_id) : route('shifts.index');
        default:
            return route('notifications.index');
    }
}

function handleNotificationClick(notification: Notification) {
    const url = getNotificationUrl(notification);
    if (!notification.read) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        fetch(route('notifications.mark-as-read', notification.id), {
            method: 'PATCH',
            headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
        }).finally(() => {
            if (url !== route('notifications.index')) router.visit(url);
            else router.reload();
        });
    } else if (url !== route('notifications.index')) {
        router.visit(url);
    }
}

function handleMarkAllRead() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    fetch(route('notifications.mark-all-read'), {
        method: 'PATCH',
        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
    }).finally(() => router.reload());
}

export default function NotificationsIndex({ notifications, unread_count }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground">
                            {unread_count > 0 ? `${unread_count} unread` : 'All caught up'}
                        </p>
                    </div>
                    {unread_count > 0 && (
                        <Button variant="outline" onClick={handleMarkAllRead}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            All Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {notifications.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Bell className="mx-auto h-10 w-10 mb-3 opacity-40" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`flex items-start justify-between gap-4 p-4 rounded-lg border cursor-pointer transition-colors
                                            ${!notification.read
                                                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">{notification.title}</p>
                                                {!notification.read && (
                                                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(notification.created_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
