
'use client'


import React, { useEffect, useState } from 'react'
import ListingItems from '../ListingItems'
import Link from 'next/link'
import { getPropertiesWithFilters } from '@/api/property'
import { getPrimaryPropertyImage } from '@/utils/resolveImage'

const toRentFlag = (item) => {
  const raw =
    item?.listingStatus ||
    item?.description?.listingStatus ||
    item?.description?.propertyFor ||
    item?.propertyFor ||
    "";
  return String(raw).toLowerCase().includes("rent");
};

const toCardItem = (item) => {
  const priceNum = Number(item?.description?.price);
  const price = Number.isFinite(priceNum) && priceNum > 0 ? `$${priceNum.toLocaleString()}` : "$0";
  const city = item?.location?.city?.name || "";
  const state = item?.location?.state?.name || "";
  return {
    id: item?._id,
    slug: item?.description?.slug || item?._id,
    title: item?.description?.title || "Property",
    image: getPrimaryPropertyImage(item),
    price,
    bed: item?.details?.bedrooms ?? 0,
    bath: item?.details?.bathrooms ?? 0,
    sqft: item?.details?.sizeInSqFt ?? item?.details?.sizeInFt ?? 0,
    location: [city, state].filter(Boolean).join(", "),
    forRent: toRentFlag(item),
    featured: false,
  };
};

export default function ListingItemsContainer({ agentId }) {
    const [allItems, setAllItems] = useState([])
    const [pageData, setPageData] = useState([])

    useEffect(() => {
      let cancelled = false;
      if (!agentId) {
        setAllItems([]);
        return;
      }

      (async () => {
        try {
          const res = await getPropertiesWithFilters({
            assignedAgent: agentId,
            limit: 40,
            page: 1,
            sort: "-createdAt",
          });
          const raw = Array.isArray(res?.data) ? res.data : [];
          const mapped = raw.map(toCardItem);
          if (!cancelled) setAllItems(mapped);
        } catch {
          if (!cancelled) setAllItems([]);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [agentId]);

    useEffect(() => {
      setPageData(allItems.slice(0, 4));
    }, [allItems]);
    
  return (
<div className="row align-items-center mt20">
                <div className="col-sm-4">
                  <h6 className="fz17">Listing {allItems.length}</h6>
                </div>
                {/* End .col-4 */}

                <div className="col-lg-12">
                  <div className="tab-content" id="pills-tabContent">
                    <div
                      className="tab-pane fade show active"
                      id="pills-home"
                      role="tabpanel"
                      aria-labelledby="pills-home-tab"
                    >
                      <div className="row">
                        <ListingItems data={pageData} />
                      </div>
                    </div>
                    {/* End tab-pane */}

                   
                    {/* End tab-pane */}
                  </div>
                  {/* End tab-content */}

                  <div className="d-grid pb30 bdrb1">
                    <Link href="/properties" className="ud-btn btn-white2">
                      Show all {allItems.length} property
                      <i className="fal fa-arrow-right-long" />
                    </Link>
                  </div>
                </div>
              </div>
  )
}
