import nyscLogo from "@/assets/nysc-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={nyscLogo} alt="NYSC Logo" className="h-8 w-8 object-contain" />
            <span className="font-display font-semibold text-foreground">NYSC Swap</span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Helping corps members exchange items with ease.
          </p>
          
          <p className="text-sm text-muted-foreground">
            Developed by Platoon 5 Kwara Camp 2025 Batch C
          </p>
        </div>
      </div>
    </footer>
  );
}
