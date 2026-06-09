"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

const SearchBoxContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      } else {
        params.delete("search");
      }
      
      router.push(`/blog?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div className="sidebar-widget mb30">
      <div className="search_area">
        <input
          type="text"
          className="form-control"
          placeholder="What are you looking for?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
        />
        
        
      </div>
    </div>
  );
};

const SearchBox = () => {
  return (
    <Suspense fallback={<div className="sidebar-widget mb30"><div className="search_area"><input type="text" className="form-control" placeholder="What are you looking for?"/><label><span className="flaticon-search"/></label></div></div>}>
      <SearchBoxContent />
    </Suspense>
  );
};

export default SearchBox;
