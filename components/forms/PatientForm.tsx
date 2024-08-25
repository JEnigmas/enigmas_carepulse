"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CustomFormField from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { UserFormValidation } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/actions/patient.actions"
export enum FormFieldType {
  INPUT = 'input',
  TEXTAREA = 'textarea',
  PHONE_INPUT = 'phoneInput',
  CHECKBOX = 'checkbox',
  DATE_PICKER = 'datePicker',
  SELECT = 'select',
  SKELETON = 'skeleton',
}


const PatientForm = () => {
  const router = useRouter();
  const[isLoading, setIsLoading] = useState(false);
  // 1. Define your form.
  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit({name, email, phone}: z.infer<typeof UserFormValidation>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values)
    // console.log(`Navigating to ....`);
    setIsLoading(true); 
    try {
      const userData = { name, email, phone }; console.log(userData);
      const user = await createUser(userData);
      
      if(user) {console.log("hellio")
        router.push(`/patients/${user.$id}/register`);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex-1">
        <section className="mb-12 m-y-4">
            <h1 className="header">Welcome</h1>
            <p className="text-dark-700 mt-2">Schedule your first appointment</p>
        </section>
        {/* <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <CustomFormField 
            fieldType = {FormFieldType.INPUT}
            control={form.control}
            name = "name"
            label = "Full Name"
            placeholder = "John Doe"
            iconSrc = "/assets/icons/user.svg"
            iconAlt = "user"
        />
        <CustomFormField 
            fieldType = {FormFieldType.INPUT}
            control={form.control}
            name = "email"
            label = "Email"
            placeholder = "abc@gmail.com"
            iconSrc = "/assets/icons/email.svg"
            iconAlt = "email"
        />
        <CustomFormField 
            fieldType = {FormFieldType.PHONE_INPUT}
            control={form.control}
            name = "phone"
            label = "Phone Number"
            placeholder = "0372325255"
        />
        {/* <Button type="submit">Submit</Button> */}
        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  )
}

export default PatientForm
