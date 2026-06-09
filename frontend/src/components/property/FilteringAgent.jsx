
'use client'


import React, { useEffect, useState } from 'react'
import TopFilter from './TopFilter'




import agents from '@/data/agents';
import PaginationTwo from '../listing/PaginationTwo';
import Image from 'next/image';
import Link from 'next/link';
export default function FilteringAgent() {
    const [filteredData, setFilteredData] = useState([]);
    const [currentSortingOption, setCurrentSortingOption] = useState('Newest')
    const [sortedFilteredData, setSortedFilteredData] = useState([]);
        const [pageNumber, setPageNumber] = useState(1)
    const [pageItems, setPageItems] = useState([])
    const [pageContentTrac, setPageContentTrac] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    useEffect(() => {
      setPageItems(sortedFilteredData
        .slice((pageNumber - 1) * 15, pageNumber * 15))
        setPageContentTrac([((pageNumber - 1) * 15) + 1 ,pageNumber * 15,sortedFilteredData.length])
    }, [pageNumber,sortedFilteredData])
    const [propertyTypes, setPropertyTypes] = useState([])
    const [location, setLocation] = useState('All Cities')
    const resetFilter = ()=>{

      setPropertyTypes([])
      setLocation('All Cities')
      setCurrentSortingOption('Newest')
     document.querySelectorAll(".filterInput").forEach(function(element) {
      element.value = null;
  });

    }
    const handlepropertyTypes =(elm)=>{

      if (elm == 'All') {
        setPropertyTypes([])
        
      } else {
        setPropertyTypes(pre=>pre.includes(elm) ? [...pre.filter((el)=>el!=elm)] : [...pre,elm])
      }
    }
  
    const handlelocation =(elm)=>{
      console.log(elm)
      setLocation(elm)
    }


    
   const filterFunctions={
    handlepropertyTypes,
    
    handlelocation,
    setSearchQuery,
    
    propertyTypes,
    resetFilter,
    location,
    setPropertyTypes,
  }



    useEffect(() => {
      
        const refItems = agents.filter((elm) => {
         return  elm
          });
      
          let filteredArrays = [];
      
          if (propertyTypes.length > 0) {
            const filtered = refItems.filter((elm) =>
            propertyTypes.includes(elm.category)
            );
            filteredArrays = [...filteredArrays, filtered];
          }
          filteredArrays = [...filteredArrays,refItems.filter((el=>el.name.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()) )) ];
         
          if (location != 'All Cities') {
            filteredArrays = [...filteredArrays,refItems.filter((el=>el.city == location)) ];
          }

          const commonItems = refItems.filter((item) =>
            filteredArrays.every((array) => array.includes(item))
          );
          setFilteredData(commonItems);
    }, [
       
        propertyTypes,
        location,
        searchQuery
    ])

    useEffect(() => {
      setPageNumber(1)
      setSortedFilteredData(filteredData)
    }, [filteredData,currentSortingOption,])
    
    
  return (
    <section className="our-agents pt-0">
        <div className="container">
          <div className="row align-items-center mb20">
            <TopFilter  filterFunctions={filterFunctions} />
          </div>
          {/* End .row */}

          <div
            className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {pageItems.map((agent) => (
              <div className="col" key={agent.id}>
                <div className="feature-style2 mb30">
                  <div className="feature-img">
                    <Link href={`/agent/${agent.id}`}>
                      <Image
                        width={210}
                        height={240}
                        className="bdrs12 w-100 h-100 cover"
                        src={agent.image}
                        alt="agents"
                      />
                    </Link>
                  </div>
                  <div className="feature-content pt20">
                    <h6 className="title mb-1">
                      <Link href={`/agent/${agent.id}`}>{agent.name}</Link>
                    </h6>
                    <p className="text fz15">Broker</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* End .row */}

          <div className="row justify-content-center mt20">
            <PaginationTwo pageNumber={pageNumber} setPageNumber={setPageNumber} data={sortedFilteredData} pageCapacity={15}/>
          </div>
        </div>
      </section>
  )
}
