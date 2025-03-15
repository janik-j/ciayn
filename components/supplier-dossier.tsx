"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Globe, 
  Building, 
  MapPin, 
  Users, 
  AlertCircle,
  Info,
  Database,
  Newspaper
} from "lucide-react"
import { CompanySearch } from "./company-search"
import { NewsFeedAnalyzer } from "./news-feed-analyzer"
import { useRouter } from "next/navigation"
// Use type from our client
import { SupplierData, supabase } from "@/lib/supabase/client"
// Import the auth hook to get the current user
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import { countries } from "@/lib/countries"

type DisplaySupplierData = {
  id?: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  website: string;
  esgRisk: {
    environmental: "Low" | "Medium" | "High";
    social: "Low" | "Medium" | "High";
    governance: "Low" | "Medium" | "High";
  };
  redFlags: string[];
  complianceStatus: {
    lksg: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    cbam: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    csdd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    csrd: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
    reach: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown";
  };
  recommendations: string[];
  countryScore?: number; // Optional for backward compatibility
}

interface SupplierDossierProps {
  initialData?: DisplaySupplierData;
}

type DocumentUploadType = {
  name: string;
  description: string;
  status: "Required" | "Recommended";
  uploaded: boolean;
};

export default function SupplierDossier({ initialData }: SupplierDossierProps) {
  const [results, setResults] = useState<DisplaySupplierData | null>(initialData || null)
  const router = useRouter()
  // Get the current user from the auth hook
  const { user } = useAuth()
  const { toast } = useToast()
  // Track if the supplier is already added to the user's list
  const [isAlreadyAdded, setIsAlreadyAdded] = useState(false)
  // Track loading state for the check
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [countryScore, setCountryScore] = useState<number | null>(null); // Change to null for initial state
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  // Mock document upload state for LkSG (would be fetched from server in production)
  const [lksgDocuments, setLksgDocuments] = useState<DocumentUploadType[]>([
    {
      name: "Human Rights Policy",
      description: "Required as part of the due diligence framework.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Environmental Policy",
      description: "Required as the Act explicitly covers environmental due diligence.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Annual Risk Analysis & Due Diligence Report",
      description: "Companies must produce annual reports on due diligence obligations.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Complaints Procedure Documentation",
      description: "The Act explicitly makes complaint procedures mandatory.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Supplier Code of Conduct/Audit Reports",
      description: "Practical tools to fulfill the mandatory due diligence obligations.",
      status: "Recommended",
      uploaded: false
    }
  ]);

  // Mock document upload state for CSRD
  const [csrdDocuments, setCsrdDocuments] = useState<DocumentUploadType[]>([
    {
      name: "Annual Sustainability Report (ESRS-compliant)",
      description: "Required for applicable companies based on size and timeline. Companies must report according to European Sustainability Reporting Standards.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Double Materiality Assessment",
      description: "Required as part of ESRS 2 General Disclosures. Companies must conduct a materiality analysis to determine which additional content needs reporting.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Climate Transition Plan",
      description: "May be required as part of specific sector disclosures depending on materiality assessment outcomes.",
      status: "Recommended",
      uploaded: false
    }
  ]);

  // Mock document upload state for CBAM
  const [cbamDocuments, setCbamDocuments] = useState<DocumentUploadType[]>([
    {
      name: "Carbon Emissions Reports",
      description: "Required quarterly during the transition period (October 1, 2023, to December 31, 2025) for importers of covered goods.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Emissions Calculation Documentation",
      description: "Since August 1, 2024, it has become mandatory to use the methods defined by the CBAM Regulation for determining emissions.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Supplier Emissions Verification",
      description: "Having verification processes is pragmatic given that from 2026, CBAM certificates for all embedded emissions will be necessary.",
      status: "Recommended",
      uploaded: false
    }
  ]);

  // Mock document upload state for REACH
  const [reachDocuments, setReachDocuments] = useState<DocumentUploadType[]>([
    {
      name: "Substance Registration Documentation",
      description: "REACH requires registration of substances manufactured or imported in quantities of 1 tonne or more per year.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Safety Data Sheets (SDS)",
      description: "Required for hazardous substances and mixtures to communicate information on hazards and safe handling.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Authorization Documentation",
      description: "Required for substances of very high concern (SVHCs) listed in Annex XIV of REACH.",
      status: "Required",
      uploaded: false
    },
    {
      name: "Supply Chain Communication Records",
      description: "Documentation of information exchange with suppliers and customers about substances in products.",
      status: "Recommended",
      uploaded: false
    }
  ]);

  // Check if the supplier is already in the user's list
  const checkIfAlreadyAdded = async () => {
    if (!user || !results?.id) return

    setCheckingStatus(true)
    try {
      const { data, error } = await supabase
        .from('user_supplier_association')
        .select('user, supplier')
        .eq('user', user.id)
        .eq('supplier', results.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking supplier association:', error)
        toast({
          title: "Error",
          description: "Failed to check supplier status. Please try again.",
          variant: "destructive"
        })
      }

      setIsAlreadyAdded(!!data)
    } catch (error) {
      console.error('Unexpected error checking supplier association:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  // Check if supplier is already added when component mounts or when user/results change
  useEffect(() => {
    if (user && results?.id) {
      checkIfAlreadyAdded()
    }
  }, [user, results])

  const handleCompanyFound = (companyData: DisplaySupplierData) => {
    // If we're on the supplier detail page, redirect to profile
    if (initialData) {
      router.push(`/profile/${encodeURIComponent(companyData.name)}`);
    } else {
      // Otherwise just update the state
      setResults(companyData)
    }
  }

  const handleNewSearch = () => {
    // If we're on the supplier detail page, go back to dashboard
    if (initialData) {
      router.push('/dashboard')
    } else {
      // Otherwise just clear the results
      setResults(null)
    }
  }

  const getRiskColor = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low":
        return "bg-emerald-500"
      case "Medium":
        return "bg-amber-500"
      case "High":
        return "bg-red-500"
      default:
        return "bg-slate-300"
    }
  }

  const getComplianceColor = (status: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown") => {
    switch (status) {
      case "Compliant":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "Partially Compliant":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "Non-Compliant":
        return "bg-red-100 text-red-800 border-red-200"
      case "Unknown":
        return "bg-slate-100 text-slate-800 border-slate-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getComplianceScore = (status: "Compliant" | "Partially Compliant" | "Non-Compliant" | "Unknown") => {
    switch (status) {
      case "Compliant":
        return 100;
      case "Partially Compliant":
        return 50;
      case "Non-Compliant":
        return 0;
      case "Unknown":
        return 25;
      default:
        return 0;
    }
  }

  const getTotalComplianceScore = () => {
    if (!results) return 0;
    
    const scores = [
      getComplianceScore(results.complianceStatus.lksg),
      getComplianceScore(results.complianceStatus.csrd),
      getComplianceScore(results.complianceStatus.cbam),
      getComplianceScore(results.complianceStatus.reach),
      getComplianceScore(results.complianceStatus.csdd)
    ];
    
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(average);
  }

  // Function to get country score (mock value for now)
  const getCountryScore = async () => {
    if (!results) return 0;
    
    try {
      const { data: incidents, error } = await supabase
        .from('uhri_incidents')
        .select('countries')
      
      if (error) {
        console.error('Error fetching incidents:', error);
        return 50;
      }

      const countryIncidents: { [key: string]: number } = {};
      let totalIncidents = 0;

      incidents.forEach(incident => {
        if (Array.isArray(incident.countries)) {
          incident.countries.forEach((country: string) => {
            countryIncidents[country] = (countryIncidents[country] || 0) + 1;
            totalIncidents++;
          });
        }
      });

      const countryRatios = Object.entries(countryIncidents).map(([country, count]) => ({
        country,
        ratio: count / totalIncidents
      }));

      const ratios = countryRatios.map(c => c.ratio);
      const minRatio = Math.min(...ratios);
      const maxRatio = Math.max(...ratios);

      const ourCountry = results.country;
      const ourRatio = countryIncidents[ourCountry] ? countryIncidents[ourCountry] / totalIncidents : 0;
      const score = maxRatio === minRatio ? 50 :
        Math.round(100 - ((ourRatio - minRatio) / (maxRatio - minRatio)) * 100);

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
      "Colombia": "co", "Comoros": "km", "Congo": "cg",
      "Congo, Democratic Republic of the": "cd", "Costa Rica": "cr", "Côte d'Ivoire": "ci",
      "Croatia": "hr", "Cuba": "cu", "Cyprus": "cy", "Czech Republic": "cz", "Denmark": "dk",
      "Djibouti": "dj", "Dominica": "dm", "Dominican Republic": "do", "Ecuador": "ec",
      "Egypt": "eg", "El Salvador": "sv", "Equatorial Guinea": "gq", "Eritrea": "er",
      "Estonia": "ee", "Eswatini": "sz", "Ethiopia": "et", "Fiji": "fj", "Finland": "fi",
      "France": "fr", "Gabon": "ga", "Gambia": "gm", "Georgia": "ge", "Germany": "de",
      "Ghana": "gh", "Greece": "gr", "Grenada": "gd", "Guatemala": "gt", "Guinea": "gn",
      "Guinea-Bissau": "gw", "Guyana": "gy", "Haiti": "ht", "Honduras": "hn", "Hungary": "hu",
      "Iceland": "is", "India": "in", "Indonesia": "id", "Iran": "ir", "Iraq": "iq",
      "Ireland": "ie", "Israel": "il", "Italy": "it", "Jamaica": "jm", "Japan": "jp",
      "Jordan": "jo", "Kazakhstan": "kz", "Kenya": "ke", "Kiribati": "ki",
      "Korea, North": "kp", "Korea, South": "kr", "Kuwait": "kw", "Kyrgyzstan": "kg",
      "Laos": "la", "Latvia": "lv", "Lebanon": "lb", "Lesotho": "ls", "Liberia": "lr",
      "Libya": "ly", "Liechtenstein": "li", "Lithuania": "lt", "Luxembourg": "lu",
      "Madagascar": "mg", "Malawi": "mw", "Malaysia": "my", "Maldives": "mv", "Mali": "ml",
      "Malta": "mt", "Marshall Islands": "mh", "Mauritania": "mr", "Mauritius": "mu",
      "Mexico": "mx", "Micronesia": "fm", "Moldova": "md", "Monaco": "mc", "Mongolia": "mn",
      "Montenegro": "me", "Morocco": "ma", "Mozambique": "mz", "Myanmar": "mm",
      "Namibia": "na", "Nauru": "nr", "Nepal": "np", "Netherlands": "nl", "New Zealand": "nz",
      "Nicaragua": "ni", "Niger": "ne", "Nigeria": "ng", "North Macedonia": "mk",
      "Norway": "no", "Oman": "om", "Pakistan": "pk", "Palau": "pw", "Panama": "pa",
      "Papua New Guinea": "pg", "Paraguay": "py", "Peru": "pe", "Philippines": "ph",
      "Poland": "pl", "Portugal": "pt", "Qatar": "qa", "Romania": "ro", "Russia": "ru",
      "Rwanda": "rw", "Saint Kitts and Nevis": "kn", "Saint Lucia": "lc",
      "Saint Vincent and the Grenadines": "vc", "Samoa": "ws", "San Marino": "sm",
      "Sao Tome and Principe": "st", "Saudi Arabia": "sa", "Senegal": "sn", "Serbia": "rs",
      "Seychelles": "sc", "Sierra Leone": "sl", "Singapore": "sg", "Slovakia": "sk",
      "Slovenia": "si", "Solomon Islands": "sb", "Somalia": "so", "South Africa": "za",
      "South Sudan": "ss", "Spain": "es", "Sri Lanka": "lk", "Sudan": "sd", "Suriname": "sr",
      "Sweden": "se", "Switzerland": "ch", "Syria": "sy", "Taiwan": "tw", "Tajikistan": "tj",
      "Tanzania": "tz", "Thailand": "th", "Timor-Leste": "tl", "Togo": "tg", "Tonga": "to",
      "Trinidad and Tobago": "tt", "Tunisia": "tn", "Turkey": "tr", "Turkmenistan": "tm",
      "Tuvalu": "tv", "Uganda": "ug", "Ukraine": "ua", "United Arab Emirates": "ae",
      "United Kingdom": "gb", "United States": "us", "Uruguay": "uy", "Uzbekistan": "uz",
      "Vanuatu": "vu", "Vatican City": "va", "Venezuela": "ve", "Vietnam": "vn",
      "Yemen": "ye", "Zambia": "zm", "Zimbabwe": "zw"
    };
    
    // Return the country code if found, otherwise return a default
    return countryCodeMap[countryName] || 'xx';
  }

  // Helper function to get country name (simplified since we only have the name)
  const getCountryName = (countryValue: string) => {
    // Find by exact match
    const country = countries.find(c => 
      c.toLowerCase() === countryValue.toLowerCase()
    );
    
    // Return the proper name if found, otherwise the original value
    return country || countryValue;
  }

  // Handle file upload (mock implementation)
  const handleFileUpload = (documentIndex: number, documentType: 'lksg' | 'csrd' | 'cbam' | 'reach') => {
    // In a real implementation, this would trigger a file upload dialog and upload to server
    // For now, we'll just toggle the uploaded state
    switch (documentType) {
      case 'lksg':
        const updatedLksgDocuments = [...lksgDocuments];
        updatedLksgDocuments[documentIndex].uploaded = true;
        setLksgDocuments(updatedLksgDocuments);
        toast({
          title: "Document uploaded",
          description: `${lksgDocuments[documentIndex].name} has been successfully uploaded.`,
        });
        break;
      case 'csrd':
        const updatedCsrdDocuments = [...csrdDocuments];
        updatedCsrdDocuments[documentIndex].uploaded = true;
        setCsrdDocuments(updatedCsrdDocuments);
        toast({
          title: "Document uploaded",
          description: `${csrdDocuments[documentIndex].name} has been successfully uploaded.`,
        });
        break;
      case 'cbam':
        const updatedCbamDocuments = [...cbamDocuments];
        updatedCbamDocuments[documentIndex].uploaded = true;
        setCbamDocuments(updatedCbamDocuments);
        toast({
          title: "Document uploaded",
          description: `${cbamDocuments[documentIndex].name} has been successfully uploaded.`,
        });
        break;
      case 'reach':
        const updatedReachDocuments = [...reachDocuments];
        updatedReachDocuments[documentIndex].uploaded = true;
        setReachDocuments(updatedReachDocuments);
        toast({
          title: "Document uploaded",
          description: `${reachDocuments[documentIndex].name} has been successfully uploaded.`,
        });
        break;
    }
  }

  // Function to add the supplier to the user's suppliers
  const addToMySuppliers = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to add suppliers.",
        variant: "destructive"
      })
      return
    }

    if (!results?.id) {
      toast({
        title: "Error",
        description: "Supplier information is incomplete.",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('user_supplier_association')
        .insert([
          { 
            user: user.id, 
            supplier: results.id,
            created_at: new Date().toISOString()
          }
        ])
        .select('user, supplier')
        .single()
      
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already added",
            description: `${results.name} is already in your suppliers list.`,
            variant: "default"
          })
          setIsAlreadyAdded(true)
          return
        }
        throw error
      }
      
      setIsAlreadyAdded(true)
      
      toast({
        title: "Success",
        description: `${results.name} has been added to your suppliers.`,
      })
    } catch (error) {
      console.error("Error adding supplier:", error)
      toast({
        title: "Error",
        description: "Failed to add supplier. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Function to remove the supplier from the user's suppliers
  const removeFromMySuppliers = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to remove suppliers.",
        variant: "destructive"
      })
      return
    }

    if (!results?.id) {
      toast({
        title: "Error",
        description: "Supplier information is incomplete.",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase
        .from('user_supplier_association')
        .delete()
        .eq('user', user.id)
        .eq('supplier', results.id)
        .select('user, supplier')
        .single()
      
      if (error) {
        throw error
      }
      
      setIsAlreadyAdded(false)
      
      toast({
        title: "Success",
        description: `${results.name} has been removed from your suppliers.`,
      })
    } catch (error) {
      console.error("Error removing supplier:", error)
      toast({
        title: "Error",
        description: "Failed to remove supplier. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle button click based on current state
  const handleSupplierButtonClick = () => {
    if (isAlreadyAdded) {
      removeFromMySuppliers()
    } else {
      addToMySuppliers()
    }
  }

  // Update the useEffect to handle loading state
  useEffect(() => {
    const loadCountryScore = async () => {
      if (results) {
        setIsLoadingScore(true);
        const score = await getCountryScore();
        setCountryScore(score);
        setIsLoadingScore(false);
      }
    };
    loadCountryScore();
  }, [results]);

  return (
    <div className="space-y-6">
      {!results ? (
        <CompanySearch onCompanyFound={handleCompanyFound} />
      ) : (
        <div>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{results.name}</CardTitle>
                  <CardDescription>Supplier Assessment and Compliance</CardDescription>
                </div>
                {user && (
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={handleSupplierButtonClick}
                    disabled={checkingStatus}
                    className={isAlreadyAdded ? "text-black-500 hover:text-red-600" : ""}
                  >
                    {checkingStatus ? 'Checking...' : 
                     isAlreadyAdded ? 'Remove from My Suppliers' : 'Add to My Suppliers'}
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="main" className="w-full">
            <TabsList className="w-full border-b">
              <TabsTrigger value="main" className="flex-1">Main</TabsTrigger>
              <TabsTrigger value="lksg" className="flex-1">Supply Chain Due Diligence Act</TabsTrigger>
              <TabsTrigger value="csrd" className="flex-1">CSRD</TabsTrigger>
              <TabsTrigger value="cbam" className="flex-1">CBAM</TabsTrigger>
              <TabsTrigger value="reach" className="flex-1">REACH</TabsTrigger>
              <TabsTrigger value="news" className="flex-1">News/AI</TabsTrigger>
            </TabsList>

            {/* Main Tab Content */}
            <TabsContent value="main">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Company Information Card */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Industry</p>
                              <p className="text-sm font-medium">{results.industry}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Country</p>
                              <p className="text-sm font-medium">{results.country}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Employees</p>
                              <p className="text-sm font-medium">{results.employees}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Website</p>
                              <a
                                href={results.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                              >
                                {results.website}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-3">Red Flags</h3>
                        <div className="space-y-2">
                          {results.redFlags.length > 0 ? (
                            results.redFlags.map((flag, index) => (
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
                              <CardTitle className="text-base">Supply Chain Due Diligence Act</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <Badge className={getComplianceColor(results.complianceStatus.lksg)}>
                                  {results.complianceStatus.lksg}
                                </Badge>
                                <Progress value={getComplianceScore(results.complianceStatus.lksg)} className="w-24 h-2" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">CSRD</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <Badge className={getComplianceColor(results.complianceStatus.csrd)}>
                                  {results.complianceStatus.csrd}
                                </Badge>
                                <Progress value={getComplianceScore(results.complianceStatus.csrd)} className="w-24 h-2" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">CBAM</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <Badge className={getComplianceColor(results.complianceStatus.cbam)}>
                                  {results.complianceStatus.cbam}
                                </Badge>
                                <Progress value={getComplianceScore(results.complianceStatus.cbam)} className="w-24 h-2" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">REACH</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <Badge className={getComplianceColor(results.complianceStatus.reach)}>
                                  {results.complianceStatus.reach}
                                </Badge>
                                <Progress value={getComplianceScore(results.complianceStatus.reach)} className="w-24 h-2" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Total Score Card */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-6">
                      <div className="relative w-48 h-48">
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
                          <div className="absolute text-4xl font-bold">
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
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Country Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-6 mr-3 rounded overflow-hidden border border-slate-200">
                          <img 
                            src={`https://flagcdn.com/w80/${getCountryCode(results?.country || '')}.png`} 
                            alt={`${getCountryName(results?.country || '')} flag`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-lg font-medium">{getCountryName(results?.country || '')}</span>
                      </div>
                      <div className="relative w-32 h-32">
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
            </TabsContent>

            {/* Supply Chain Due Diligence Act Tab Content */}
            <TabsContent value="lksg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Supply Chain Due Diligence Act</CardTitle>
                      <CardDescription>
                        The Supply Chain Due Diligence Act has been in force since January 1, 2023. 
                        It initially applied to companies with at least 3,000 employees in Germany and expanded to those with at least 1,000 employees from 2024.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-3">Compliance Status</h3>
                        <div className="flex items-center gap-3">
                          <Badge className={getComplianceColor(results.complianceStatus.lksg)}>
                            {results.complianceStatus.lksg}
                          </Badge>
                          <Progress 
                            value={getComplianceScore(results.complianceStatus.lksg)} 
                            className="flex-1 h-2"
                          />
                          <span className="text-sm font-medium">
                            {getComplianceScore(results.complianceStatus.lksg)}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Alert>
                          <Info className="h-4 w-4 text-blue-500" />
                          <AlertTitle className="ml-2 text-sm font-medium">Regulation Overview</AlertTitle>
                          <AlertDescription className="ml-2 text-sm">
                            This legislation establishes mandatory human rights and environmental due diligence requirements along the entire supply chain. Companies must establish risk management systems, analyze human rights risks, and implement preventive measures.
                          </AlertDescription>
                        </Alert>

                        <h3 className="text-sm font-medium pt-2">Required Documentation</h3>
                        <div className="space-y-3">
                          {lksgDocuments.map((doc, index) => (
                            <div 
                              key={index}
                              className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-slate-400" />
                                  <h4 className="font-medium">{doc.name}</h4>
                                  <Badge variant="outline" className="ml-2">
                                    {doc.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {doc.uploaded ? (
                                  <>
                                    <Badge className="bg-emerald-100 text-emerald-800">Uploaded</Badge>
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleFileUpload(index, 'lksg')}
                                    className="flex items-center gap-2"
                                  >
                                    <Upload className="h-4 w-4" />
                                    Upload
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">Documentation Completeness</h3>
                            <span className="text-sm font-medium">
                              {lksgDocuments.filter(doc => doc.uploaded).length}/{lksgDocuments.length}
                            </span>
                          </div>
                          <Progress 
                            value={lksgDocuments.filter(doc => doc.uploaded).length / lksgDocuments.length * 100} 
                            className="h-2"
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Required Documents</h3>
                          <div className="space-y-2">
                            {lksgDocuments
                              .filter(doc => doc.status === "Required")
                              .map((doc, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                                >
                                  <span>{doc.name}</span>
                                  {doc.uploaded ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Next Steps</h3>
                          <ul className="space-y-2 text-sm">
                            {lksgDocuments.some(doc => doc.status === "Required" && !doc.uploaded) && (
                              <li className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                                <span>Upload all required documents to improve compliance</span>
                              </li>
                            )}
                            {results.complianceStatus.lksg === "Partially Compliant" && (
                              <li className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                                <span>Schedule risk assessment to identify improvement areas</span>
                              </li>
                            )}
                            {results.complianceStatus.lksg === "Non-Compliant" && (
                              <li className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                <span>Urgent action required - engage with supplier immediately</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* CSRD Tab Content - Now with document uploads */}
            <TabsContent value="csrd">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Corporate Sustainability Reporting Directive (CSRD)</CardTitle>
                      <CardDescription>
                        The CSRD introduces expanded sustainability reporting requirements with phased implementation starting in 2024 for certain companies.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-3">Compliance Status</h3>
                        <div className="flex items-center gap-3">
                          <Badge className={getComplianceColor(results.complianceStatus.csrd)}>
                            {results.complianceStatus.csrd}
                          </Badge>
                          <Progress 
                            value={getComplianceScore(results.complianceStatus.csrd)} 
                            className="flex-1 h-2"
                          />
                          <span className="text-sm font-medium">
                            {getComplianceScore(results.complianceStatus.csrd)}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Alert>
                          <Info className="h-4 w-4 text-blue-500" />
                          <AlertTitle className="ml-2 text-sm font-medium">Regulation Overview</AlertTitle>
                          <AlertDescription className="ml-2 text-sm">
                            The CSRD introduces a more detailed reporting requirement that requires companies to report according to mandatory European Sustainability Reporting Standards (ESRS). It covers environmental, social, governance, and human rights aspects.
                          </AlertDescription>
                        </Alert>

                        <h3 className="text-sm font-medium pt-2">Required Documentation</h3>
                        <div className="space-y-3">
                          {csrdDocuments.map((doc, index) => (
                            <div 
                              key={index}
                              className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-slate-400" />
                                  <h4 className="font-medium">{doc.name}</h4>
                                  <Badge variant="outline" className="ml-2">
                                    {doc.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {doc.uploaded ? (
                                  <>
                                    <Badge className="bg-emerald-100 text-emerald-800">Uploaded</Badge>
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleFileUpload(index, 'csrd')}
                                    className="flex items-center gap-2"
                                  >
                                    <Upload className="h-4 w-4" />
                                    Upload
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">Documentation Completeness</h3>
                            <span className="text-sm font-medium">
                              {csrdDocuments.filter(doc => doc.uploaded).length}/{csrdDocuments.length}
                            </span>
                          </div>
                          <Progress 
                            value={csrdDocuments.filter(doc => doc.uploaded).length / csrdDocuments.length * 100} 
                            className="h-2"
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Required Documents</h3>
                          <div className="space-y-2">
                            {csrdDocuments
                              .filter(doc => doc.status === "Required")
                              .map((doc, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                                >
                                  <span>{doc.name}</span>
                                  {doc.uploaded ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Next Steps</h3>
                          <ul className="space-y-2 text-sm">
                            {csrdDocuments.some(doc => doc.status === "Required" && !doc.uploaded) && (
                              <li className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                                <span>Upload all required documents to improve compliance</span>
                              </li>
                            )}
                            {results.complianceStatus.csrd === "Partially Compliant" && (
                              <li className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                                <span>Review Double Materiality Assessment to ensure all relevant aspects are covered</span>
                              </li>
                            )}
                            {results.complianceStatus.csrd === "Non-Compliant" && (
                              <li className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                <span>Urgent action required - CSRD compliance will be mandatory soon</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* CBAM Tab Content - Now with document uploads */}
            <TabsContent value="cbam">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>EU Carbon Border Adjustment Mechanism (CBAM)</CardTitle>
                      <CardDescription>
                        CBAM is being phased in gradually to align with the phase-out of free allowances under the EU Emissions Trading System. It aims to prevent carbon leakage by ensuring importers from non-EU countries bear similar costs for greenhouse gas emissions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-3">Compliance Status</h3>
                        <div className="flex items-center gap-3">
                          <Badge className={getComplianceColor(results.complianceStatus.cbam)}>
                            {results.complianceStatus.cbam}
                          </Badge>
                          <Progress 
                            value={getComplianceScore(results.complianceStatus.cbam)} 
                            className="flex-1 h-2"
                          />
                          <span className="text-sm font-medium">
                            {getComplianceScore(results.complianceStatus.cbam)}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Alert>
                          <Info className="h-4 w-4 text-blue-500" />
                          <AlertTitle className="ml-2 text-sm font-medium">Regulation Overview</AlertTitle>
                          <AlertDescription className="ml-2 text-sm">
                            CBAM requires importers to purchase certificates corresponding to the embedded carbon emissions in their imported goods. It currently applies to cement, iron and steel, aluminium, fertilizers, electricity and hydrogen.
                          </AlertDescription>
                        </Alert>

                        <h3 className="text-sm font-medium pt-2">Required Documentation</h3>
                        <div className="space-y-3">
                          {cbamDocuments.map((doc, index) => (
                            <div 
                              key={index}
                              className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-slate-400" />
                                  <h4 className="font-medium">{doc.name}</h4>
                                  <Badge variant="outline" className="ml-2">
                                    {doc.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {doc.uploaded ? (
                                  <>
                                    <Badge className="bg-emerald-100 text-emerald-800">Uploaded</Badge>
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleFileUpload(index, 'cbam')}
                                    className="flex items-center gap-2"
                                  >
                                    <Upload className="h-4 w-4" />
                                    Upload
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">Documentation Completeness</h3>
                            <span className="text-sm font-medium">
                              {cbamDocuments.filter(doc => doc.uploaded).length}/{cbamDocuments.length}
                            </span>
                          </div>
                          <Progress 
                            value={cbamDocuments.filter(doc => doc.uploaded).length / cbamDocuments.length * 100} 
                            className="h-2"
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Required Documents</h3>
                          <div className="space-y-2">
                            {cbamDocuments
                              .filter(doc => doc.status === "Required")
                              .map((doc, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                                >
                                  <span>{doc.name}</span>
                                  {doc.uploaded ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Next Steps</h3>
                          <ul className="space-y-2 text-sm">
                            {cbamDocuments.some(doc => doc.status === "Required" && !doc.uploaded) && (
                              <li className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                                <span>Upload all required documents to improve compliance</span>
                              </li>
                            )}
                            {results.complianceStatus.cbam === "Partially Compliant" && (
                              <li className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                                <span>Review emissions calculation methods against CBAM requirements</span>
                              </li>
                            )}
                            {results.complianceStatus.cbam === "Non-Compliant" && (
                              <li className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                <span>Urgent action required - prepare for full CBAM implementation in 2026</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* REACH Tab Content - Now with document uploads */}
            <TabsContent value="reach">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>EU REACH Regulation</CardTitle>
                      <CardDescription>
                        REACH (Registration, Evaluation, Authorization and Restriction of Chemicals) is a European Union regulation concerning chemicals and their safe use, which aims to improve the protection of human health and the environment.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-3">Compliance Status</h3>
                        <div className="flex items-center gap-3">
                          <Badge className={getComplianceColor(results.complianceStatus.reach)}>
                            {results.complianceStatus.reach}
                          </Badge>
                          <Progress 
                            value={getComplianceScore(results.complianceStatus.reach)} 
                            className="flex-1 h-2"
                          />
                          <span className="text-sm font-medium">
                            {getComplianceScore(results.complianceStatus.reach)}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Alert>
                          <Info className="h-4 w-4 text-blue-500" />
                          <AlertTitle className="ml-2 text-sm font-medium">Regulation Overview</AlertTitle>
                          <AlertDescription className="ml-2 text-sm">
                            REACH places the responsibility on companies to manage the risks from chemicals and to provide safety information on the substances. Manufacturers and importers must register each substance manufactured or imported in quantities of 1 tonne or more per year.
                          </AlertDescription>
                        </Alert>

                        <h3 className="text-sm font-medium pt-2">Required Documentation</h3>
                        <div className="space-y-3">
                          {reachDocuments.map((doc, index) => (
                            <div 
                              key={index}
                              className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-slate-400" />
                                  <h4 className="font-medium">{doc.name}</h4>
                                  <Badge variant="outline" className="ml-2">
                                    {doc.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {doc.uploaded ? (
                                  <>
                                    <Badge className="bg-emerald-100 text-emerald-800">Uploaded</Badge>
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleFileUpload(index, 'reach')}
                                    className="flex items-center gap-2"
                                  >
                                    <Upload className="h-4 w-4" />
                                    Upload
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">Documentation Completeness</h3>
                            <span className="text-sm font-medium">
                              {reachDocuments.filter(doc => doc.uploaded).length}/{reachDocuments.length}
                            </span>
                          </div>
                          <Progress 
                            value={reachDocuments.filter(doc => doc.uploaded).length / reachDocuments.length * 100} 
                            className="h-2"
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Required Documents</h3>
                          <div className="space-y-2">
                            {reachDocuments
                              .filter(doc => doc.status === "Required")
                              .map((doc, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                                >
                                  <span>{doc.name}</span>
                                  {doc.uploaded ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                  )}
                                </div>
                              ))
                            }
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-2">Next Steps</h3>
                          <ul className="space-y-2 text-sm">
                            {reachDocuments.some(doc => doc.status === "Required" && !doc.uploaded) && (
                              <li className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                                <span>Upload all required documents to improve compliance</span>
                              </li>
                            )}
                            {results.complianceStatus.reach === "Partially Compliant" && (
                              <li className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                                <span>Review Safety Data Sheets for compliance with updated requirements</span>
                              </li>
                            )}
                            {results.complianceStatus.reach === "Non-Compliant" && (
                              <li className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                <span>Urgent action required - non-compliance with REACH can result in market access restrictions</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* News/AI Tab Content */}
            <TabsContent value="news">
              <Card>
                <CardHeader>
                  <CardTitle>News & AI Analysis</CardTitle>
                  <CardDescription>
                    Real-time news analysis and AI-driven insights about {results.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NewsFeedAnalyzer companyName={results.name} industry={results.industry} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

