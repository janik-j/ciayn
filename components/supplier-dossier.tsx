"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { CompanySearch } from "./company-search"
import { CompanyLogo } from "./company-logo"
import { SupplierData, supabase } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import { countries } from "@/lib/countries"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

// Import tab components from supplier-tabs directory
import {
  MainTab,
  LksgTab,
  CsrdTab,
  CbamTab,
  ReachTab,
  NewsAiTab,
  DocumentUploadType
} from "./supplier-tabs"

// Import prompts for each regulation
import {
  getLksgPrompt,
  getCsrdPrompt,
  getCbamPrompt,
  getReachPrompt,
  getGeneralPrompt
} from "./supplier-tabs/prompts"

// Helper functions for compliance calculations
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
  lksgDocuments: DocumentUploadType[];
  csrdDocuments: DocumentUploadType[];
  cbamDocuments: DocumentUploadType[];
  reachDocuments: DocumentUploadType[];
}

interface SupplierDossierProps {
  initialData?: DisplaySupplierData;
}

type Country = {
  code: string;
  name: string;
}

export default function SupplierDossier({ initialData }: SupplierDossierProps) {
  const [results, setResults] = useState<DisplaySupplierData | null>(initialData || null)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isAlreadyAdded, setIsAlreadyAdded] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [countryScore, setCountryScore] = useState<number | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [isSupplierOwned, setIsSupplierOwned] = useState<boolean>(true)
  const [isClaimingSupplier, setIsClaimingSupplier] = useState<boolean>(false)

  // Document states for each regulation
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

  // Update results when documents change
  useEffect(() => {
    if (results) {
      setResults({
        ...results,
        lksgDocuments,
        csrdDocuments,
        cbamDocuments,
        reachDocuments
      });
    }
  }, [lksgDocuments, csrdDocuments, cbamDocuments, reachDocuments]);

  // Check if the supplier is already in the user's list
  const checkIfAlreadyAdded = async () => {
    if (!user || !results?.id) return

    setCheckingStatus(true)
    try {
      const { data, error } = await supabase
        .from('user_supplier_lists')
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

  useEffect(() => {
    if (results?.id && user) {
      checkSupplierOwnership(results.id)
    }
  }, [results?.id, user])

  // Function to check if supplier is owned by any user
  const checkSupplierOwnership = async (supplierId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_supplier_association')
        .select('id, user')
        .eq('supplier', supplierId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error checking supplier ownership:', error)
        return
      }

      setIsSupplierOwned(!!data)
    } catch (error) {
      console.error('Unexpected error checking supplier ownership:', error)
    }
  }

  // Function to claim a supplier
  const claimSupplier = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to claim suppliers.",
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

    setIsClaimingSupplier(true)

    try {
      // Check again if supplier is already claimed (to prevent race conditions)
      const { data: existingAssociation, error: checkError } = await supabase
        .from('user_supplier_association')
        .select('id, user')
        .eq('supplier', results.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error checking supplier ownership:', checkError)
        throw new Error('Failed to check supplier ownership')
      }

      // If supplier is already claimed
      if (existingAssociation) {
        if (existingAssociation.user === user.id) {
          toast({
            title: "Already owned",
            description: "You already own this supplier.",
          })
        } else {
          toast({
            title: "Already claimed",
            description: "This supplier has already been claimed by another user.",
            variant: "destructive"
          })
        }
        setIsSupplierOwned(true)
        setIsClaimingSupplier(false)
        return
      }

      // Create association (claim supplier)
      const { error } = await supabase
        .from('user_supplier_association')
        .insert([{ user: user.id, supplier: results.id }])

      if (error) {
        // Handle unique constraint violation - user already owns a supplier
        if (error.code === '23505' && error.message.includes('user_supplier_association_user_key')) {
          toast({
            title: "Claim limit reached",
            description: "You can only claim one supplier. Please release your current supplier before claiming a new one.",
            variant: "destructive"
          })
          setIsClaimingSupplier(false)
          return
        } else {
          throw error
        }
      }

      setIsSupplierOwned(true)
      toast({
        title: "Success",
        description: `You have successfully claimed ${results.name}.`,
      })
    } catch (error) {
      console.error("Error claiming supplier:", error)
      toast({
        title: "Error",
        description: "Failed to claim supplier. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsClaimingSupplier(false)
    }
  }

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

  // Function to get country score based on incident ratios
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
      let totalCountryOccurrences = 0;

      incidents.forEach(incident => {
        if (Array.isArray(incident.countries)) {
          incident.countries.forEach((country: string) => {
            countryIncidents[country] = (countryIncidents[country] || 0) + 1;
            totalCountryOccurrences++;
          });
        }
      });

      // Sum all country occurrences (which should match totalCountryOccurrences)
      const totalCountryOccurrencesSum = Object.values(countryIncidents).reduce((sum, count) => sum + count, 0);

      const countryRatios = Object.entries(countryIncidents).map(([country, count]) => ({
        country,
        ratio: count / totalCountryOccurrencesSum
      }));

      const ratios = countryRatios.map(c => c.ratio);
      const minRatio = Math.min(...ratios);
      const maxRatio = Math.max(...ratios);

      const ourCountry = results.country;
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
        .from('user_supplier_lists')
        .insert([
          { 
            user: user.id, 
            supplier: results.id,
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
        .from('user_supplier_lists')
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
                <div className="flex items-center gap-4">
                  <CompanyLogo companyName={results.name} size={48} />
                  <div>
                    <CardTitle>{results.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <span>{results.industry}</span>
                        <span>•</span>
                        <span>{getCountryName(results.country)}</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
                <div>
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
              </div>
            </CardHeader>
          </Card>

          {user && !isSupplierOwned && (
            <Alert className="mb-4 border-amber-500 bg-amber-50">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  <Info className="h-4 w-4 text-amber-600 mr-2" />
                  <AlertTitle className="text-amber-800">
                    This supplier has not been claimed yet
                  </AlertTitle>
                </div>
                <Button 
                  variant="default"
                  size="sm" 
                  onClick={claimSupplier}
                  disabled={isClaimingSupplier}
                >
                  {isClaimingSupplier ? 'Claiming...' : 'Claim Supplier'}
                </Button>
              </div>
            </Alert>
          )}

          <Tabs defaultValue="main" className="w-full">
            <TabsList className="w-full border-b">
              <TabsTrigger value="main" className="flex-1">Main</TabsTrigger>
              <TabsTrigger value="lksg" className="flex-1">German Supply Chain Act (LkSG)</TabsTrigger>
              <TabsTrigger value="csrd" className="flex-1">CSRD</TabsTrigger>
              <TabsTrigger value="cbam" className="flex-1">CBAM</TabsTrigger>
              <TabsTrigger value="reach" className="flex-1">REACH</TabsTrigger>
              <TabsTrigger value="news" className="flex-1">Newsfeed</TabsTrigger>
            </TabsList>

            {/* Main Tab Content */}
            <TabsContent value="main">
              <MainTab 
                supplier={{
                  ...results,
                  lksgDocuments,
                  csrdDocuments,
                  cbamDocuments,
                  reachDocuments
                }}
                getComplianceScore={getComplianceScore} 
                getComplianceColor={getComplianceColor} 
              />
            </TabsContent>

            {/* Supply Chain Due Diligence Act Tab Content */}
            <TabsContent value="lksg">
              <LksgTab 
                supplier={results} 
                getComplianceScore={getComplianceScore} 
                getComplianceColor={getComplianceColor} 
                handleFileUpload={handleFileUpload}
                documents={lksgDocuments}
                setDocuments={setLksgDocuments}
              />
            </TabsContent>

            {/* CSRD Tab Content */}
            <TabsContent value="csrd">
              <CsrdTab 
                supplier={results} 
                getComplianceScore={getComplianceScore} 
                getComplianceColor={getComplianceColor} 
                handleFileUpload={handleFileUpload}
                documents={csrdDocuments}
                setDocuments={setCsrdDocuments}
              />
            </TabsContent>

            {/* CBAM Tab Content */}
            <TabsContent value="cbam">
              <CbamTab 
                supplier={results} 
                getComplianceScore={getComplianceScore} 
                getComplianceColor={getComplianceColor} 
                handleFileUpload={handleFileUpload}
                documents={cbamDocuments}
                setDocuments={setCbamDocuments}
              />
            </TabsContent>

            {/* REACH Tab Content */}
            <TabsContent value="reach">
              <ReachTab 
                supplier={results} 
                getComplianceScore={getComplianceScore} 
                getComplianceColor={getComplianceColor} 
                handleFileUpload={handleFileUpload}
                documents={reachDocuments}
                setDocuments={setReachDocuments}
              />
            </TabsContent>

            {/* News/AI Tab Content */}
            <TabsContent value="news">
              <NewsAiTab supplier={results} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
