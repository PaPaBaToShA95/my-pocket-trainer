// components/OnboardingForm.tsx
'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppData } from '@/context/AppDataProvider';
import { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Імʼя має бути не менше 2 символів.' }),
  initialWeight: z.coerce.number().positive({ message: 'Введіть коректну вагу.' }),
  height: z.coerce.number().positive({ message: 'Введіть коректний зріст.' }),
  gender: z.enum(['male', 'female', 'other'], { message: 'Оберіть стать.' }),
  targetWeight: z.coerce.number().positive({ message: 'Введіть очікувану вагу.' }),
});

export default function OnboardingForm() {
  const { updateProfile } = useAppData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      initialWeight: 75,
      height: 180,
      gender: 'male',
      targetWeight: 70,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const profile: UserProfile = {
      ...values,
      currentWeight: values.initialWeight, // На початку поточна = початкова
    };
    await updateProfile(profile);
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="text-2xl">👋 Знайомство</CardTitle>
        <CardDescription>Введіть базову інформацію для початку тренувань.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Імʼя</FormLabel>
                  <FormControl><Input placeholder="Ваше імʼя" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Стать</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Оберіть" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Чоловік</SelectItem>
                      <SelectItem value="female">Жінка</SelectItem>
                      <SelectItem value="other">Інше</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initialWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Початкова вага (кг)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Зріст (см)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="targetWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Очікувана вага (кг)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Збереження...' : 'Почати тренування'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}