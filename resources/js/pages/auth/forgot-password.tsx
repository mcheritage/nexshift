import { GalleryVerticalEnd } from "lucide-react"
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { LoaderCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    return (
        <>
            <Head title="Forgot Password" />
            
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                  <div className="flex justify-center">
                  <img 
                      src="/images/nexshiftlogo.png"
                      alt="NexShift Logo"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                    
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">Forgot your password?</CardTitle>
                            <CardDescription>
                                No problem. Just let us know your email address and we will email you a password reset link.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form method="post" action={route('password.email')}>
                                {({ processing, errors }) => (
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="email">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                autoComplete="email"
                                                placeholder="email@example.com"
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={processing}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                            Email Password Reset Link
                                        </Button>
                                    </div>
                                )}
                            </Form>
                            <div className="text-center text-sm mt-4">
                                Remember your password?{" "}
                                <TextLink href={route('login')} className="underline underline-offset-4">
                                    Log in
                                </TextLink>
                            </div>
                        </CardContent>
                    </Card>
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
