import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { z } from "zod";

import {
  useOrgActions,
  useOrgMembers,
} from "@/app/organization/create/_lib/stores/organization-store";

const EMAIL_SPLIT_REGEX = /[\s,;]+/;

// Email validation schema
const emailSchema = z.string().email("Invalid email address");

export function useMemberInvitations() {
  const memberInvitations = useOrgMembers();
  const { setMemberInvitations } = useOrgActions();
  const [emailErrors, setEmailErrors] = useState<{ [key: number]: string }>({});
  const [showValidation, setShowValidation] = useState(false);
  const lastInputRef = useRef<HTMLInputElement>(null);

  // Check for duplicate emails
  const duplicateEmails = useMemo(() => {
    const emails = memberInvitations
      .map((member) => member.email.trim().toLowerCase())
      .filter((email) => email !== "");

    const uniqueEmails = new Set<string>();
    const duplicates = new Set<string>();

    for (const email of emails) {
      if (uniqueEmails.has(email)) {
        duplicates.add(email);
      } else {
        uniqueEmails.add(email);
      }
    }

    return Array.from(duplicates);
  }, [memberInvitations]);

  // Validate emails when validation flag is true or when emails change after validation is shown
  useEffect(() => {
    if (!showValidation) {
      return;
    }

    const errors: { [key: number]: string } = {};

    memberInvitations.forEach((member, index) => {
      // Skip validation for empty emails
      if (!member.email.trim()) {
        return;
      }

      // Validate with Zod
      const result = emailSchema.safeParse(member.email);
      if (result.success) {
        return;
      }

      errors[index] = result.error.message || "Validation failed";
    });

    setEmailErrors(errors);
  }, [memberInvitations, showValidation]);

  const addMember = () => {
    setMemberInvitations([...memberInvitations, { email: "", role: "member" }]);

    // Focus the new input after render
    setTimeout(() => {
      lastInputRef.current?.focus();
    }, 0);
  };

  const removeMember = (index: number) => {
    const newMembers = [...memberInvitations];
    newMembers.splice(index, 1);
    setMemberInvitations(
      newMembers.length ? newMembers : [{ email: "", role: "member" }],
    );
  };

  const updateMemberField = <K extends "email" | "role">(
    index: number,
    field: K,
    value: (typeof memberInvitations)[number][K],
  ) => {
    const newMembers = [...memberInvitations];
    newMembers[index]![field] = value;
    setMemberInvitations(newMembers);
  };

  const updateMemberEmail = (index: number, email: string) =>
    updateMemberField(index, "email", email);

  const updateMemberRole = (
    index: number,
    role: "owner" | "admin" | "member",
  ) => updateMemberField(index, "role", role);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Create a new input on space, comma, or enter
    if ([" ", ",", "Enter"].includes(e.key)) {
      e.preventDefault();
      const emailValue = memberInvitations[index]!.email.trim();

      if (emailValue) {
        const newMembers = [...memberInvitations];
        newMembers[index]!.email = emailValue;
        newMembers.splice(index + 1, 0, { email: "", role: "member" });
        setMemberInvitations(newMembers);

        // Focus the new input after render
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>(
            'input[id^="member-email-"]',
          );
          if (inputs[index + 1]) {
            inputs[index + 1]!.focus();
          }
        }, 0);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text");
    const emails = pastedText
      .split(EMAIL_SPLIT_REGEX)
      .filter((email) => email.trim());

    if (emails.length) {
      const newMembers = [...memberInvitations];
      // Replace the current email with the first pasted email
      newMembers[index]!.email = emails[0]!;

      // Add additional emails as new members
      if (emails.length > 1) {
        const additionalMembers = emails.slice(1).map(
          (email) =>
            ({
              email,
              role: "member",
            }) as {
              email: string;
              role: "member" | "owner" | "admin";
            },
        );

        newMembers.splice(index + 1, 0, ...additionalMembers);
      }

      setMemberInvitations(newMembers);

      // Focus the last input after render
      setTimeout(() => {
        const inputs = Array.from(
          document.querySelectorAll<HTMLInputElement>(
            'input[id^="member-email-"]',
          ),
        );

        if (inputs.length) {
          inputs.at(-1)?.focus();
        }
      }, 0);
    }
  };

  const hasValidEmails = memberInvitations.some(
    (member, index) =>
      member.email.trim() !== "" &&
      member.email.includes("@") &&
      !(showValidation && emailErrors[index]),
  );

  // Function to validate all emails
  const validateEmails = () => {
    setShowValidation(true);

    const errors: { [key: number]: string } = {};
    let hasErrors = false;

    memberInvitations.forEach((member, index) => {
      // Skip validation for empty emails
      if (!member.email.trim()) {
        return;
      }

      // Validate with Zod
      const result = emailSchema.safeParse(member.email);
      if (result.success) {
        return;
      }

      errors[index] = result.error.message || "Validation failed";
      hasErrors = true;
    });

    setEmailErrors(errors);
    return !hasErrors;
  };

  return {
    memberInvitations,
    emailErrors,
    duplicateEmails,
    lastInputRef,
    hasValidEmails,
    addMember,
    removeMember,
    updateMemberEmail,
    updateMemberRole,
    handleKeyDown,
    handlePaste,
    validateEmails,
    showValidation,
  };
}
