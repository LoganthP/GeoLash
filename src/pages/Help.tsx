import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mail, MessageSquare, FileText, Map, Shield, AlertTriangle } from "lucide-react";

const faqs = [
  {
    question: "How do I register a new property?",
    answer: "Navigate to 'Register Property' from the sidebar. Fill in all required details including survey number, owner information, location coordinates, and upload supporting documents. Submit the form for verification by an officer.",
  },
  {
    question: "How can I view my land records on the map?",
    answer: "Go to 'Map View' from the sidebar. Your registered properties will appear as markers on the map. Click on any marker to view details. You can also search for specific locations using the search bar.",
  },
  {
    question: "What do the different status colors mean?",
    answer: "Green (Verified) means the record has been approved by an officer. Yellow (Pending) indicates the record is awaiting verification. Red (Disputed) means there's an active dispute on the property.",
  },
  {
    question: "How do I file a dispute?",
    answer: "Navigate to 'Disputes' and click 'File New Dispute'. Select the land record in question, provide a detailed description of your dispute, and upload any supporting evidence. An officer will review your case.",
  },
  {
    question: "How do I upload documents for my property?",
    answer: "Go to 'Documents' from the sidebar. Click 'Upload Document', select the file, and associate it with your property record. Supported formats include PDF, images, and common document types.",
  },
  {
    question: "Who can verify land records?",
    answer: "Only users with 'Officer' or 'Admin' roles can verify land records. If you believe your record should be verified, please contact your local land office or file a request through the system.",
  },
];

const Help = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Help Center</h1>
        <p className="text-muted-foreground mt-1">
          Find answers to common questions and learn how to use GeoLash
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Land Records</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how to view, register, and manage land records
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Map className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Map Features</h3>
                <p className="text-sm text-muted-foreground">
                  Navigate the interactive map and property boundaries
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Disputes</h3>
                <p className="text-sm text-muted-foreground">
                  File and track property disputes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Quick answers to common questions about using the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Need More Help?
          </CardTitle>
          <CardDescription>
            Can't find what you're looking for? Get in touch with our support team
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <Mail className="w-4 h-4" />
            Contact Support
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            View Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
