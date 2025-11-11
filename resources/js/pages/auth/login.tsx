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
            
            {status && (
                <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {status}
                </div>
            )}
        </>
    );
}
