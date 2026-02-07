import { useState } from "react";
import { Search as SearchIcon, MapPin, User, FileText, History, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLandRecords } from "@/hooks/useLandRecords";
import { useNavigate } from "react-router-dom";

const recentSearches = [
  { query: "Survey 123/4A", type: "survey", timestamp: "2 hours ago" },
  { query: "Ramesh Kumar", type: "owner", timestamp: "Yesterday" },
  { query: "Devanahalli", type: "location", timestamp: "3 days ago" },
];

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("survey");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { data: records } = useLandRecords();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 600));

    if (records) {
      const query = searchQuery.toLowerCase();
      const results = records.filter(record => {
        if (searchType === "survey") {
          return record.survey_number.toLowerCase().includes(query);
        } else if (searchType === "owner") {
          return record.owner_name.toLowerCase().includes(query);
        } else if (searchType === "location") {
          return record.district.toLowerCase().includes(query) ||
            record.village?.toLowerCase().includes(query) ||
            record.taluka?.toLowerCase().includes(query);
        }
        return false;
      });
      setSearchResults(results);
    }

    setIsSearching(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Search Land Records
        </h1>
        <p className="text-muted-foreground mt-2">
          Find land records by survey number, owner name, or location
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-xl p-6 card-shadow">
          <Tabs defaultValue="survey" className="w-full" onValueChange={setSearchType}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="survey" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Survey No.
              </TabsTrigger>
              <TabsTrigger value="owner" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Owner
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </TabsTrigger>
            </TabsList>

            <TabsContent value="survey">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter survey number (e.g., SUR-101)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} className="glow" disabled={isSearching}>
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4 mr-2" />}
                  Search
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="owner">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter owner name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} className="glow" disabled={isSearching}>
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4 mr-2" />}
                  Search
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="location">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by District, Village, or Taluka"
                  className="flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} className="glow" disabled={isSearching}>
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4 mr-2" />}
                  Search
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Recent Searches or Results */}
      {!hasSearched ? (
        <div className="max-w-2xl mx-auto">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            Recent Searches
          </h3>
          <div className="space-y-2">
            {recentSearches.map((search, i) => (
              <button
                key={i}
                className="w-full glass-card rounded-lg p-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                onClick={() => {
                  setSearchQuery(search.query);
                  // We need to set the type too if we want it to work perfectly, but for now just setting query
                }}
              >
                <div className="flex items-center gap-3">
                  {search.type === "survey" && <FileText className="w-4 h-4 text-muted-foreground" />}
                  {search.type === "owner" && <User className="w-4 h-4 text-muted-foreground" />}
                  {search.type === "location" && <MapPin className="w-4 h-4 text-muted-foreground" />}
                  <span>{search.query}</span>
                </div>
                <span className="text-xs text-muted-foreground">{search.timestamp}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <h3 className="font-display font-semibold mb-3">
            {searchResults.length} results for "{searchQuery}"
          </h3>
          {searchResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No records found matching your criteria.
            </div>
          ) : (
            <div className="grid gap-4">
              {searchResults.map((result) => (
                <Card
                  key={result.id}
                  className="glass-card card-shadow hover:elevated-shadow transition-all cursor-pointer"
                  onClick={() => navigate(`/records/${result.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{result.survey_number}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs ${result.status === "verified" ? "bg-success/10 text-success" :
                          result.status === "pending" ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                        }`}>
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </span>
                    </div>
                    <CardDescription className="font-mono text-xs">{result.id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Owner</p>
                        <p className="font-medium">{result.owner_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Village</p>
                        <p className="font-medium">{result.village || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Area</p>
                        <p className="font-medium">{result.area_acres} acres</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
