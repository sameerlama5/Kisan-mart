"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send } from "lucide-react";
import { respondToWarning } from "@/lib/actions/warning-actions";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WarningResponseFormProps {
  warningId: string;
}

export default function WarningResponseForm({
  warningId,
}: WarningResponseFormProps) {
  const router = useRouter();
  const [responseType, setResponseType] = useState<
    "explanation" | "action_plan" | "appeal" | "acknowledgment"
  >("acknowledgment");
  const [message, setMessage] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please provide a response message");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("warningId", warningId);
    formData.append("message", message);
    formData.append("responseType", responseType);
    if (actionPlan.trim()) {
      formData.append("actionPlan", actionPlan);
    }

    try {
      const result = await respondToWarning(formData);

      if (result.error) {
        alert(result.error);
      } else {
        alert("Response submitted successfully!");
        setShowForm(false);
        router.refresh();
      }
    } catch (error) {
      alert("Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const responseTypeDescriptions = {
    acknowledgment: "Acknowledge the warning and confirm understanding",
    explanation: "Provide an explanation for the issue mentioned",
    action_plan: "Present a detailed plan to address the concerns",
    appeal: "Appeal the warning if you believe it was issued in error",
  };

  if (!showForm) {
    return (
      <div className="mt-4">
        <Button onClick={() => setShowForm(true)} className="w-full">
          <MessageCircle className="h-4 w-4 mr-2" />
          Respond to Warning
        </Button>
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Respond to Warning
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="responseType">Response Type</Label>
            <Select
              value={responseType}
              onValueChange={(
                value:
                  | "explanation"
                  | "action_plan"
                  | "appeal"
                  | "acknowledgment"
              ) => setResponseType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                <SelectItem value="explanation">Explanation</SelectItem>
                <SelectItem value="action_plan">Action Plan</SelectItem>
                <SelectItem value="appeal">Appeal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {responseTypeDescriptions[responseType]}
            </p>
          </div>

          <div>
            <Label htmlFor="message">Your Response *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                responseType === "acknowledgment"
                  ? "I acknowledge this warning and understand the concerns raised..."
                  : responseType === "explanation"
                  ? "I would like to explain the circumstances that led to this issue..."
                  : responseType === "action_plan"
                  ? "Here is my plan to address the concerns and prevent future issues..."
                  : "I believe this warning was issued in error because..."
              }
              rows={4}
              required
            />
          </div>

          {responseType === "action_plan" && (
            <div>
              <Label htmlFor="actionPlan">Detailed Action Plan</Label>
              <Textarea
                id="actionPlan"
                value={actionPlan}
                onChange={(e) => setActionPlan(e.target.value)}
                placeholder="Provide specific steps you will take to address the issues:
1. Immediate actions...
2. Long-term improvements...
3. Timeline for implementation..."
                rows={6}
              />
            </div>
          )}

          {responseType === "appeal" && (
            <Alert>
              <AlertDescription>
                Appeals will be reviewed by the admin team. Please provide clear
                evidence or reasoning for why you believe this warning should be
                reconsidered.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </Button>
            <Button
              className="text-primary"
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
