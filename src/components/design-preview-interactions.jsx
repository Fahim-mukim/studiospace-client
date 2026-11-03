"use client";

import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DialogClose,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DesignPreviewInteractions() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Buttons & badges</CardTitle>
          <CardDescription>
            Clear hierarchy, confident color, and comfortably sized controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button>Explore spaces <ArrowUpRight aria-hidden="true" /></Button>
          <Button variant="secondary">Secondary action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Quiet action</Button>
          <Button variant="destructive">Destructive</Button>
          <Badge>Curated space</Badge>
          <Badge variant="outline">Verified host</Badge>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Button focus states are visible with keyboard navigation.
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form controls</CardTitle>
          <CardDescription>
            Labels remain visible independently of field placeholders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="design-preview-email">Email address</Label>
          <Input
            autoComplete="email"
            id="design-preview-email"
            placeholder="you@example.com"
            type="email"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overlays & menus</CardTitle>
          <CardDescription>
            Keyboard-operable primitives for focused tasks and compact actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  A considered confirmation
                </DialogTitle>
                <DialogDescription>
                  Dialogs keep the current task in context and return focus
                  when closed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Got it</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>StudioSpace panel</SheetTitle>
                <SheetDescription>
                  A responsive surface for mobile navigation or filters.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open example actions"
                size="icon"
                variant="outline"
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Save for later</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="About keyboard focus"
                size="icon"
                variant="ghost"
              >
                <span aria-hidden="true">?</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Focus indicators also work by keyboard.</TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div
          aria-hidden="true"
          className="flex min-h-40 items-end bg-secondary p-5"
        >
          <div className="flex size-full min-h-28 items-end justify-between rounded-xl border border-border/70 bg-brand-sage/15 p-4">
            <span className="text-xs font-medium text-muted-foreground">
              Component surface · no stock image
            </span>
            <span className="size-10 rounded-full border border-brand-copper/50" />
          </div>
        </div>
        <CardContent className="space-y-2 pt-5">
          <Badge variant="category">Category label</Badge>
          <h3 className="font-display text-2xl">A quiet card foundation</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Future studio cards can build on this surface while keeping their
            own image-led editorial composition.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
