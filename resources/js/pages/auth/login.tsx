import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <>
            <Head title="Log in" />
            
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                {status && (
                    <div className="w-full max-w-md bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-center shadow-sm">
                        {status}
                    </div>
                )}
                <div className="flex w-full max-w-sm flex-col gap-6">
                  <div className="flex justify-center">
                  <img 
                      src="/images/nexshiftlogo.png"
                      alt="NexShift Logo"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                    <LoginForm canResetPassword={canResetPassword} />
                </div>
            </div>
        </>
    );
}
