import { Repeat, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Repeat className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold text-foreground">NYSC Swap</span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Helping corps members exchange items with ease.
          </p>
          
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> for NYSC
          </p>
        </div>
      </div>
    </footer>
  );
}
