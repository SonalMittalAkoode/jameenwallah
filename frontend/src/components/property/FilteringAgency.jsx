
'use client'


import React, { useEffect, useState } from 'react'
import TopFilter from './TopFilter'




import PaginationTwo from '../listing/PaginationTwo';
import { agentsData } from '@/data/agency';
import Image from 'next/image';
import Link from 'next/link';

export default function FilteringAgency() {
    const [filteredData, setFilteredData] = useState([]);
    const [currentSortingOption, setCurrentSortingOption] = useState('Newest')
    const [sortedFilteredData, setSortedFilteredData] = useState([]);
        const [pageNumber, setPageNumber] = useState(1)
    const [pageItems, setPageItems] = useState([])
    const [pageContentTrac, setPageContentTrac] = useState([])
     const [searchQuery, setSearchQuery] = useState('')
    useEffect(() => {
      setPageItems(sortedFilteredData
        .slice((pageNumber - 1) * 14, pageNumber * 14))
        setPageContentTrac([((pageNumber - 1) * 14) + 1 ,pageNumber * 14,sortedFilteredData.length])
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
      
        const refItems = agentsData.filter((elm) => {
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
            className="row"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {pageItems.map((agent) => (
              <div key={agent.id} className="col-md-6 col-lg-4">
                <div className="agency-style1 p30 bdrs12 bdr1 mb30">
                  <div className="agency-img">
                    <Image
                      width={324}
                      height={209}
                      className="w-100 contain"
                      src={agent.imgSrc}
                      alt="agency"
                    />
                    <div className="tag">{agent.propertiesCount}</div>
                  </div>
                  <div className="agency-details pt40">
                    <h6 className="fw400">
                      <i className="fas fa-star review-color2 pr10 fz10" />
                      {agent.starRating}
                    </h6>
                    <h6 className="agency-title mb-1">{agent.agencyTitle}</h6>
                    <p className="fz15">{agent.address}</p>
                    <div className="d-grid">
                      <Link href={`/agency-single/${agent.id}`} className="ud-btn btn-white2">
                        View Listings
                        <i className="fal fa-arrow-right-long" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* End .row */}
          <div className="row justify-content-center mt20">
            <PaginationTwo pageNumber={pageNumber} setPageNumber={setPageNumber} data={sortedFilteredData} pageCapacity={14}/>
          </div>
        </div>
      </section>
  )
}
