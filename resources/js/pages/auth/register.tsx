import { GalleryVerticalEnd } from "lucide-react"
import { RegisterForm } from "@/components/register-form"
import { RegisterUserForm } from "@/components/register-user-form"
import { Head } from '@inertiajs/react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface RegisterProps {
    status?: string;
}

export default function Register({ status }: RegisterProps) {
    return (
        <>
            <Head title="Register" />
            
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full max-w-md flex-col gap-6">
                  <div className="flex justify-center">
                    <img
                      src="/images/nexshift-logo.JPG"
                      alt="NextShift Logo"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                    
                    <Tabs defaultValue="carehome" className="">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="carehome">Care Home</TabsTrigger>
                            <TabsTrigger value="healthworker">Health Worker</TabsTrigger>
                        </TabsList>
                        <TabsContent value="carehome" className="">
                            <RegisterForm />
                        </TabsContent>
                        <TabsContent value="healthworker" className="">
                            <RegisterUserForm />
                        </TabsContent>
                    </Tabs>
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
