"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Building, 
  MapPin, 
  Users, 
  Globe, 
  AlertTriangle, 
  CheckCircle 
} from "lucide-react"
import { TabCommonProps } from "./types"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { countries } from "@/lib/countries"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CompanyLogo } from "@/components/company-logo"

// Extend MainTabProps to include countryScore properties
type MainTabProps = Pick<TabCommonProps, 'supplier' | 'getComplianceScore' | 'getComplianceColor'>

export function MainTab({ 
  supplier, 
  getComplianceScore, 
  getComplianceColor 
}: MainTabProps) {
  const router = useRouter();
  const [countryScore, setCountryScore] = useState<number | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [documentCounts, setDocumentCounts] = useState({
    lksg: { uploaded: 0, total: 5 },
    csrd: { uploaded: 0, total: 3 },
    cbam: { uploaded: 0, total: 3 },
    reach: { uploaded: 0, total: 4 }
  });
  const [hasLksgDisclosure, setHasLksgDisclosure] = useState(false);
  
  const getTotalComplianceScore = () => {
    const scores = [
      getComplianceScore(supplier.complianceStatus.lksg),
      getComplianceScore(supplier.complianceStatus.csrd),
      getComplianceScore(supplier.complianceStatus.cbam),
      getComplianceScore(supplier.complianceStatus.reach),
      getComplianceScore(supplier.complianceStatus.csdd)
    ];
    
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(average);
  }

  // Function to get country score based on incident ratios
  const getCountryScore = async () => {
    if (!supplier) return 0;
    
    try {
      const { data: incidents, error } = await supabase
        .from('uhri_incidents')
        .select('countries')
      
      if (error) {
        console.error('Error fetching incidents:', error);
        return 50;
      }

      const countryIncidents: { [key: string]: number } = {};
      let totalCountryOccurrences = 0;

      incidents.forEach((incident: any) => {
        if (Array.isArray(incident.countries)) {
          incident.countries.forEach((country: string) => {
            countryIncidents[country] = (countryIncidents[country] || 0) + 1;
            totalCountryOccurrences++;
          });
        }
      });

      // Sum all country occurrences
      const totalCountryOccurrencesSum = Object.values(countryIncidents).reduce((sum, count) => sum + count, 0);

      const countryRatios = Object.entries(countryIncidents).map(([country, count]) => ({
        country,
        ratio: count / totalCountryOccurrencesSum
      }));

      const ratios = countryRatios.map(c => c.ratio);
      const minRatio = Math.min(...ratios);
      const maxRatio = Math.max(...ratios);

      const ourCountry = supplier.country;
      const ourRatio = countryIncidents[ourCountry] ? countryIncidents[ourCountry] / totalCountryOccurrencesSum : 0;
      
      // Handle edge cases and ensure score is between 0 and 100
      let score;
      if (maxRatio === minRatio) {
        score = 50; // Default score when all countries have the same ratio
      } else {
        // Linear interpolation: min ratio maps to 100, max ratio maps to 0
        score = Math.round(100 - ((ourRatio - minRatio) / (maxRatio - minRatio)) * 100);
        // Ensure the score is within 0-100 range
        score = Math.max(0, Math.min(100, score));
      }

      return score;
    } catch (error) {
      console.error('Error calculating country score:', error);
      return 50;
    }
  };

  // Helper function to get country code
  const getCountryCode = (countryName: string) => {
    const countryCodeMap: { [key: string]: string } = {
      "Afghanistan": "af", "Albania": "al", "Algeria": "dz", "Andorra": "ad", "Angola": "ao",
      "Antigua and Barbuda": "ag", "Argentina": "ar", "Armenia": "am", "Australia": "au",
      "Austria": "at", "Azerbaijan": "az", "Bahamas": "bs", "Bahrain": "bh", "Bangladesh": "bd",
      "Barbados": "bb", "Belarus": "by", "Belgium": "be", "Belize": "bz", "Benin": "bj",
      "Bhutan": "bt", "Bolivia": "bo", "Bosnia and Herzegovina": "ba", "Botswana": "bw",
      "Brazil": "br", "Brunei": "bn", "Bulgaria": "bg", "Burkina Faso": "bf", "Burundi": "bi",
      "Cabo Verde": "cv", "Cambodia": "kh", "Cameroon": "cm", "Canada": "ca",
      "Central African Republic": "cf", "Chad": "td", "Chile": "cl", "China": "cn",
      "Colombia": "co", "Comoros": "km", "Congo": "cg", "Congo, Democratic Republic of the": "cd", 
      "Costa Rica": "cr", "Côte d'Ivoire": "ci", "Croatia": "hr", "Cuba": "cu", "Cyprus": "cy", 
      "Czech Republic": "cz", "Denmark": "dk", "Djibouti": "dj", "Dominica": "dm", 
      "Dominican Republic": "do", "Ecuador": "ec", "Egypt": "eg", "El Salvador": "sv", 
      "Equatorial Guinea": "gq", "Eritrea": "er", "Estonia": "ee", "Eswatini": "sz", 
      "Ethiopia": "et", "Fiji": "fj", "Finland": "fi", "France": "fr", "Gabon": "ga", 
      "Gambia": "gm", "Georgia": "ge", "Germany": "de", "Ghana": "gh", "Greece": "gr", 
      "Grenada": "gd", "Guatemala": "gt", "Guinea": "gn", "Guinea-Bissau": "gw", 
      "Guyana": "gy", "Haiti": "ht", "Honduras": "hn", "Hungary": "hu", "Iceland": "is", 
      "India": "in", "Indonesia": "id", "Iran": "ir", "Iraq": "iq", "Ireland": "ie", 
      "Israel": "il", "Italy": "it", "Jamaica": "jm", "Japan": "jp", "Jordan": "jo", 
      "Kazakhstan": "kz", "Kenya": "ke", "Kiribati": "ki", "Korea, North": "kp", 
      "Korea, South": "kr", "Kuwait": "kw", "Kyrgyzstan": "kg", "Laos": "la", 
      "Latvia": "lv", "Lebanon": "lb", "Lesotho": "ls", "Liberia": "lr", "Libya": "ly", 
      "Liechtenstein": "li", "Lithuania": "lt", "Luxembourg": "lu", "Madagascar": "mg", 
      "Malawi": "mw", "Malaysia": "my", "Maldives": "mv", "Mali": "ml", "Malta": "mt", 
      "Marshall Islands": "mh", "Mauritania": "mr", "Mauritius": "mu", "Mexico": "mx", 
      "Micronesia": "fm", "Moldova": "md", "Monaco": "mc", "Mongolia": "mn", 
      "Montenegro": "me", "Morocco": "ma", "Mozambique": "mz", "Myanmar": "mm", 
      "Namibia": "na", "Nauru": "nr", "Nepal": "np", "Netherlands": "nl", 
      "New Zealand": "nz", "Nicaragua": "ni", "Niger": "ne", "Nigeria": "ng", 
      "North Macedonia": "mk", "Norway": "no", "Oman": "om", "Pakistan": "pk", 
      "Palau": "pw", "Panama": "pa", "Papua New Guinea": "pg", "Paraguay": "py", 
      "Peru": "pe", "Philippines": "ph", "Poland": "pl", "Portugal": "pt", "Qatar": "qa", 
      "Romania": "ro", "Russia": "ru", "Rwanda": "rw", "Saint Kitts and Nevis": "kn", 
      "Saint Lucia": "lc", "Saint Vincent and the Grenadines": "vc", "Samoa": "ws", 
      "San Marino": "sm", "Sao Tome and Principe": "st", "Saudi Arabia": "sa", 
      "Senegal": "sn", "Serbia": "rs", "Seychelles": "sc", "Sierra Leone": "sl", 
      "Singapore": "sg", "Slovakia": "sk", "Slovenia": "si", "Solomon Islands": "sb", 
      "Somalia": "so", "South Africa": "za", "South Sudan": "ss", "Spain": "es", 
      "Sri Lanka": "lk", "Sudan": "sd", "Suriname": "sr", "Sweden": "se", 
      "Switzerland": "ch", "Syria": "sy", "Taiwan": "tw", "Tajikistan": "tj", 
      "Tanzania": "tz", "Thailand": "th", "Timor-Leste": "tl", "Togo": "tg", 
      "Tonga": "to", "Trinidad and Tobago": "tt", "Tunisia": "tn", "Turkey": "tr", 
      "Turkmenistan": "tm", "Tuvalu": "tv", "Uganda": "ug", "Ukraine": "ua", 
      "United Arab Emirates": "ae", "United Kingdom": "gb", "United States": "us", 
      "Uruguay": "uy", "Uzbekistan": "uz", "Vanuatu": "vu", "Vatican City": "va", 
      "Venezuela": "ve", "Vietnam": "vn", "Yemen": "ye", "Zambia": "zm", "Zimbabwe": "zw"
    };
    
    // Return the country code if found, otherwise return a default
    return countryCodeMap[countryName] || 'xx';
  };

  // Helper function to get country name
  const getCountryName = (countryValue: string) => {
    // Find by exact match
    const country = countries.find(c => 
      c.toLowerCase() === countryValue.toLowerCase()
    );
    
    // Return the proper name if found, otherwise the original value
    return country || countryValue;
  };

  // Fetch country score on component mount
  useEffect(() => {
    const loadCountryScore = async () => {
      if (supplier) {
        setIsLoadingScore(true);
        const score = await getCountryScore();
        setCountryScore(score);
        setIsLoadingScore(false);
      }
    };
    loadCountryScore();
  }, [supplier]);

  // Fetch document counts from Supabase
  useEffect(() => {
    const fetchDocumentCounts = async () => {
      if (!supplier?.id) return;

      try {
        const { data: documents, error } = await supabase
          .from('documents')
          .select('*')
          .eq('supplier_id', supplier.id)
          .eq('status', 'active');

        if (error) {
          console.error('Error fetching documents:', error);
          return;
        }

        // Count documents by type
        const counts = {
          lksg: documents?.filter(doc => 
            doc.document_type.toLowerCase().includes('lksg') || 
            doc.document_type.toLowerCase().includes('german supply chain')
          ).length || 0,
          csrd: documents?.filter(doc => 
            doc.document_type.toLowerCase().includes('csrd') || 
            doc.document_type.toLowerCase().includes('sustainability reporting')
          ).length || 0,
          cbam: documents?.filter(doc => 
            doc.document_type.toLowerCase().includes('cbam') || 
            doc.document_type.toLowerCase().includes('carbon border')
          ).length || 0,
          reach: documents?.filter(doc => 
            doc.document_type.toLowerCase().includes('reach') || 
            doc.document_type.toLowerCase().includes('chemical')
          ).length || 0
        };

        setDocumentCounts({
          lksg: { 
            uploaded: counts.lksg,
            total: 5 
          },
          csrd: { 
            uploaded: counts.csrd,
            total: 3 
          },
          cbam: { 
            uploaded: counts.cbam,
            total: 3 
          },
          reach: { 
            uploaded: counts.reach,
            total: 4 
          }
        });
      } catch (error) {
        console.error('Error fetching document counts:', error);
      }
    };

    fetchDocumentCounts();
  }, [supplier?.id]);

  // Replace the LKSG disclosure check with the new logic
  useEffect(() => {
    const checkLksgDisclosure = async () => {
      if (!supplier?.id) return;

      try {
        // First get all suppliers associated with users
        const { data: associations, error: assocError } = await supabase
          .from('user_supplier_association')
          .select('user')
          .eq('supplier', supplier.id);

        if (assocError) {
          console.error('Error checking supplier associations:', assocError);
          return;
        }

        if (!associations || associations.length === 0) {
          setHasLksgDisclosure(false);
          return;
        }

        // Get all user IDs that are associated with this supplier
        const userIds = associations.map(assoc => assoc.user);

        // Check if any of these users have an LKSG disclosure
        const { data: disclosures, error: discError } = await supabase
          .from('lksg_disclosures')
          .select('*')
          .in('user_id', userIds)
          .single();

        if (discError) {
          console.error('Error checking LKSG disclosures:', discError);
          return;
        }

        setHasLksgDisclosure(!!disclosures);
      } catch (error) {
        console.error('Error in LKSG disclosure check:', error);
      }
    };

    checkLksgDisclosure();
  }, [supplier?.id]);

  const navigateToTab = (tab: string) => {
    router.push(`/suppliers/${supplier.id}/${tab}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:min-h-[700px]">
      {/* Company Information Card */}
      <div className="md:col-span-2 h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <CompanyLogo companyName={supplier.name} size={48} />
              <div>
                <CardTitle className="text-2xl">{supplier.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <Building className="h-4 w-4" />
                    {supplier.industry}
                    <span className="mx-1">•</span>
                    <MapPin className="h-4 w-4" />
                    {supplier.country}
                    <span className="mx-1">•</span>
                    <Users className="h-4 w-4" />
                    {supplier.employees.toLocaleString()} employees
                    {supplier.website && (
                      <>
                        <span className="mx-1">•</span>
                        <Globe className="h-4 w-4" />
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          Website
                        </a>
                      </>
                    )}
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Industry</p>
                    <p className="text-sm font-medium">{supplier.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Country</p>
                    <p className="text-sm font-medium">{supplier.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Employees</p>
                    <p className="text-sm font-medium">{supplier.employees}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Website</p>
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      {supplier.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Red Flags</h3>
              <div className="space-y-2">
                {supplier.redFlags.length > 0 ? (
                  supplier.redFlags.map((flag, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <AlertTitle className="ml-2 text-sm font-medium">Risk Identified</AlertTitle>
                      <AlertDescription className="ml-2 text-sm">{flag}</AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <AlertTitle className="ml-2 text-sm font-medium">No Risks Identified</AlertTitle>
                    <AlertDescription className="ml-2 text-sm">
                      No significant red flags have been identified for this supplier.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Compliance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">German Supply Chain Act (LkSG)</CardTitle>
                    <CardDescription className="text-sm text-slate-500">Documents Uploaded</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-semibold">
                            {documentCounts.lksg.uploaded}
                          </span>
                          <span className="text-lg text-slate-500">
                            / {documentCounts.lksg.total}
                          </span>
                        </div>
                        <Badge 
                          className={
                            hasLksgDisclosure
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {hasLksgDisclosure
                            ? "Disclosure Added" 
                            : "Missing Disclosure"
                          }
                        </Badge>
                      </div>
                      {!hasLksgDisclosure && (
                        <p className="text-sm text-red-600 mt-2">
                          This supplier hasn't submitted any LKSG disclosure information. This is a significant compliance concern as it could indicate lack of due diligence in their supply chain management.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">CSRD</CardTitle>
                    <CardDescription className="text-sm text-slate-500">Documents Uploaded</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-semibold">
                          {documentCounts.csrd.uploaded}
                        </span>
                        <span className="text-lg text-slate-500">
                          / {documentCounts.csrd.total}
                        </span>
                      </div>
                      {documentCounts.csrd.uploaded < documentCounts.csrd.total ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigateToTab('csrd')}
                          className="text-xs"
                        >
                          Upload Documents
                        </Button>
                      ) : (
                        <Badge className={getComplianceColor(supplier.complianceStatus.csrd)}>
                          {supplier.complianceStatus.csrd}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">CBAM</CardTitle>
                    <CardDescription className="text-sm text-slate-500">Documents Uploaded</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-semibold">
                          {documentCounts.cbam.uploaded}
                        </span>
                        <span className="text-lg text-slate-500">
                          / {documentCounts.cbam.total}
                        </span>
                      </div>
                      {documentCounts.cbam.uploaded < documentCounts.cbam.total ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigateToTab('cbam')}
                          className="text-xs"
                        >
                          Upload Documents
                        </Button>
                      ) : (
                        <Badge className={getComplianceColor(supplier.complianceStatus.cbam)}>
                          {supplier.complianceStatus.cbam}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">REACH</CardTitle>
                    <CardDescription className="text-sm text-slate-500">Documents Uploaded</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-semibold">
                          {documentCounts.reach.uploaded}
                        </span>
                        <span className="text-lg text-slate-500">
                          / {documentCounts.reach.total}
                        </span>
                      </div>
                      {documentCounts.reach.uploaded < documentCounts.reach.total ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigateToTab('reach')}
                          className="text-xs"
                        >
                          Upload Documents
                        </Button>
                      ) : (
                        <Badge className={getComplianceColor(supplier.complianceStatus.reach)}>
                          {supplier.complianceStatus.reach}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Right Column with Scores */}
      <div className="h-full flex flex-col justify-between">
        {/* Compliance Score Card */}
        <Card className="flex-1 mb-6 flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Compliance Score</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pt-2">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    strokeWidth="10" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={
                      getTotalComplianceScore() >= 75 ? "#10b981" : 
                      getTotalComplianceScore() >= 50 ? "#f59e0b" : 
                      "#ef4444"
                    } 
                    strokeWidth="10" 
                    strokeDasharray={`${getTotalComplianceScore() * 2.83} 283`} 
                    strokeDashoffset="0" 
                    strokeLinecap="round" 
                    transform="rotate(-90 50 50)" 
                  />
                </svg>
                <div className="absolute text-3xl font-bold">
                  {getTotalComplianceScore()}%
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-sm font-medium mb-2">Overall Rating</h3>
              <Badge 
                className={`
                  ${getTotalComplianceScore() >= 75 ? "bg-emerald-100 text-emerald-800" : 
                    getTotalComplianceScore() >= 50 ? "bg-amber-100 text-amber-800" : 
                    "bg-red-100 text-red-800"} 
                  px-3 py-1
                `}
              >
                {getTotalComplianceScore() >= 75 ? "Good" : 
                  getTotalComplianceScore() >= 50 ? "Needs Improvement" : 
                  "At Risk"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Country Score Card */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle>Country Score</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pt-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-6 mr-3 rounded overflow-hidden border border-slate-200">
                <img 
                  src={`https://flagcdn.com/w80/${getCountryCode(supplier?.country || '')}.png`} 
                  alt={`${getCountryName(supplier?.country || '')} flag`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-medium">{getCountryName(supplier?.country || '')}</span>
            </div>
            <div className="relative w-32 h-32 mt-2">
              {isLoadingScore ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
                </div>
              ) : countryScore !== null ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#e2e8f0" 
                      strokeWidth="10" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke={
                        countryScore >= 75 ? "#10b981" : 
                        countryScore >= 50 ? "#f59e0b" : 
                        "#ef4444"
                      } 
                      strokeWidth="10" 
                      strokeDasharray={`${countryScore * 2.83} 283`} 
                      strokeDashoffset="0" 
                      strokeLinecap="round" 
                      transform="rotate(-90 50 50)" 
                    />
                  </svg>
                  <div className="absolute text-3xl font-bold">
                    {countryScore}%
                  </div>
                </div>
              ) : null}
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-sm font-medium mb-2">Country Risk Rating</h3>
              {isLoadingScore ? (
                <Badge variant="outline">Calculating...</Badge>
              ) : countryScore !== null ? (
                <Badge 
                  className={`
                    ${countryScore >= 75 ? "bg-emerald-100 text-emerald-800" : 
                      countryScore >= 50 ? "bg-amber-100 text-amber-800" : 
                      "bg-red-100 text-red-800"} 
                    px-3 py-1
                  `}
                >
                  {countryScore >= 75 ? "Low Risk" : 
                    countryScore >= 50 ? "Medium Risk" : 
                    "High Risk"}
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 