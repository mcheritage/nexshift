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

interface RegisterFormProps {
  className?: string
  processing?: boolean
  errors?: Record<string, string>
}

export function RegisterForm({
  className,
  processing = false,
  errors = {},
  ...props
}: RegisterFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Register as Care Home</CardTitle>
          <CardDescription>
            Enter your organization information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" action={route('register.carehome')}>
            {({ processing: formProcessing, errors: formErrors }) => (
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Name of Organization</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="ABC Care Ltd"
                    required
                    autoFocus
                    autoComplete="name"
                  />
                  <InputError message={formErrors.name} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Admin. Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@abccareltd.com"
                    required
                    autoComplete="email"
                  />
                  <InputError message={formErrors.email} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                    autoComplete="new-password"
                  />
                  <InputError message={formErrors.password} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password_confirmation">Confirm Password</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    required
                    autoComplete="new-password"
                  />
                  <InputError message={formErrors.password_confirmation} />
                </div>
                <Button type="submit" className="w-full" disabled={formProcessing}>
                  {formProcessing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                  Create account
                </Button>
              </div>
            )}
          </Form>
          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <TextLink href={route('login')} className="underline underline-offset-4">
              Log in
            </TextLink>
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
