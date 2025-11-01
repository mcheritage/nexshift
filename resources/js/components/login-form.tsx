import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form } from '@inertiajs/react'
import InputError from '@/components/input-error'
import TextLink from '@/components/text-link'
import { LoaderCircle } from 'lucide-react'

interface LoginFormProps {
  className?: string
  canResetPassword?: boolean
  processing?: boolean
  errors?: Record<string, string>
}

export function LoginForm({
  className,
  canResetPassword = true,
  processing = false,
  errors = {},
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Form method="post" action={route('login')} resetOnSuccess={['password']}>
              {({ processing: formProcessing, errors: formErrors }) => (
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="m@example.com"
                      required
                      autoFocus
                      autoComplete="email"
                    />
                    <InputError message={formErrors.email} />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      {canResetPassword && (
                        <TextLink
                          href={route('password.request')}
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </TextLink>
                      )}
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      name="password"
                      required 
                      autoComplete="current-password"
                    />
                    <InputError message={formErrors.password} />
                  </div>
                  <Button type="submit" className="w-full" disabled={formProcessing}>
                    {formProcessing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                    Login
                  </Button>
                </div>
              )}
            </Form>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <TextLink href={route('register')} className="underline underline-offset-4">
                Sign up
              </TextLink>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
