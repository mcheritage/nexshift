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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form } from '@inertiajs/react'
import InputError from '@/components/input-error'
import TextLink from '@/components/text-link'
import { LoaderCircle } from 'lucide-react'

interface RegisterUserFormProps {
  className?: string
  processing?: boolean
  errors?: Record<string, string>
}

export function RegisterUserForm({
  className,
  processing = false,
  errors = {},
  ...props
}: RegisterUserFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Register as Health Worker</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" action={route('register')}>
            {({ processing: formProcessing, errors: formErrors }) => (
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-3">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      type="text"
                      name="first_name"
                      placeholder="John"
                      required
                      autoFocus
                      autoComplete="given-name"
                    />
                    <InputError message={formErrors.first_name} />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      type="text"
                      name="last_name"
                      placeholder="Doe"
                      required
                      autoComplete="family-name"
                    />
                    <InputError message={formErrors.last_name} />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="other_names">Other Names (Optional)</Label>
                  <Input
                    id="other_names"
                    type="text"
                    name="other_names"
                    placeholder="Middle name, nickname, etc."
                    autoComplete="additional-name"
                  />
                  <InputError message={formErrors.other_names} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <InputError message={formErrors.gender} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john.doe@example.com"
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
                  Create Health Worker Account
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
