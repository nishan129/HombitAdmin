import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function UpdateSheet({ children, title, btnRef }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button ref={btnRef} className="hidden" variant="outline">
          Open
        </Button>
      </SheetTrigger>
      {/* Add overflow-y-auto to make the content scrollable when it overflows */}
      <SheetContent className="overflow-y-auto max-h-screen">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Make changes here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="w-full mt-5 mb-5 mx-auto p-5 bg-slate-50 rounded-md shadow">
          {children}
        </div>
        {/* <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
