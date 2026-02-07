import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddOwnershipRecord } from "@/hooks/useOwnershipHistory";

const formSchema = z.object({
  owner_name: z.string().min(2, "Owner name must be at least 2 characters"),
  transfer_type: z.enum(["purchase", "inheritance", "gift", "partition", "government_allotment"]),
  transfer_date: z.string().min(1, "Transfer date is required"),
  document_number: z.string().optional(),
  consideration_amount: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface OwnershipHistoryFormProps {
  landRecordId: string;
  trigger?: React.ReactNode;
}

export function OwnershipHistoryForm({ landRecordId, trigger }: OwnershipHistoryFormProps) {
  const [open, setOpen] = useState(false);
  const addOwnershipRecord = useAddOwnershipRecord();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner_name: "",
      transfer_type: "purchase",
      transfer_date: new Date().toISOString().split("T")[0],
      document_number: "",
      consideration_amount: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await addOwnershipRecord.mutateAsync({
      land_record_id: landRecordId,
      owner_name: values.owner_name,
      owner_id: null,
      transfer_type: values.transfer_type,
      transfer_date: values.transfer_date,
      document_number: values.document_number || null,
      consideration_amount: values.consideration_amount || null,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Transfer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Property Transfer</DialogTitle>
          <DialogDescription>
            Add a new ownership transfer record to track property mutations and transfers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="owner_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Owner Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter owner name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="transfer_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="purchase">Purchase/Sale</SelectItem>
                        <SelectItem value="inheritance">Inheritance</SelectItem>
                        <SelectItem value="gift">Gift Deed</SelectItem>
                        <SelectItem value="partition">Partition</SelectItem>
                        <SelectItem value="government_allotment">Government Allotment</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transfer_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., DOC-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consideration_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consideration Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount if applicable"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addOwnershipRecord.isPending}>
                {addOwnershipRecord.isPending ? "Adding..." : "Add Transfer Record"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
