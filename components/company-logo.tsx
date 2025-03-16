import Image from 'next/image';

interface CompanyLogoProps {
  companyName: string;
  size?: number;
  className?: string;
}

export function CompanyLogo({ companyName, size = 24, className = '' }: CompanyLogoProps) {
  // Clean and format the company name for the logo URL
  const formatCompanyName = (name: string) => {
    // Remove common legal suffixes and clean the name
    const cleanName = name
      .toLowerCase()
      .replace(/(inc\.|corp\.|ltd\.|llc|gmbh|ag|sa|nv|plc|co\.|company|corporation)\.?$/i, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .trim();
    
    return cleanName;
  };

  const logoUrl = `https://logo.clearbit.com/${formatCompanyName(companyName)}.com`;
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={logoUrl}
        alt={`${companyName} logo`}
        width={size}
        height={size}
        className="rounded-sm object-contain"
        onError={(e) => {
          // Try alternative domain extensions if .com fails
          const target = e.target as HTMLImageElement;
          const extensions = ['.de', '.io', '.ai', '.org', '.net'];
          const currentUrl = target.src;
          const currentExt = currentUrl.slice(-4);
          
          // If we haven't tried all extensions yet
          const nextExtIndex = extensions.indexOf(currentExt);
          if (nextExtIndex === -1 || nextExtIndex === extensions.length - 1) {
            // If we've tried all extensions or haven't started yet, fall back to initial
            target.style.display = 'none';
            target.parentElement!.innerHTML = `<div class="w-full h-full bg-slate-200 rounded-sm flex items-center justify-center text-slate-600 font-semibold text-sm">${companyName.charAt(0)}</div>`;
          } else {
            // Try the next extension
            target.src = `https://logo.clearbit.com/${formatCompanyName(companyName)}${extensions[nextExtIndex + 1]}`;
          }
        }}
      />
    </div>
  );
}
