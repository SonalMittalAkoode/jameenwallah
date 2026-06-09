import Image from "next/image";
import Link from "next/link";
import ContactMeta from "./ContactMeta";
import Social from "./Social";
import Subscribe from "./Subscribe";
import MenuWidget from "./MenuWidget";
import Copyright from "./Copyright";

const Footer = () => {
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-xl-6 mx-auto">
            <Subscribe />
          </div>
        </div>
        {/* End .row */}

        <div className="row">
          {/* Column 1 — Brand + Contact */}
          <div className="col-sm-6 col-lg-3">
            <div className="footer-widget mb-4 mb-lg-5">
              <Link className="footer-logo" href="/">
                <img
                  width="138"
                  height="44"
                  className="mb20"
                  style={{ width: "138px", height: "auto" }}
                  src="/images/logo-white.png"
                  alt="Jameen Wallah"
                />
              </Link>
              {/* <p className="text fz15 text-gray mb30">
                Helping buyers and investors discover the right property across
                Gurgaon and Delhi NCR.
              </p> */}
              <ContactMeta />
            </div>
          </div>
          {/* End Column 1 */}

          {/* Columns 2, 3, 4 — Quick Links, Categories, Explore Other Services */}
          <MenuWidget />
          {/* End MenuWidget */}
        </div>
        {/* End .row */}
      </div>
      {/* End .container */}

      <Copyright />
      {/* End copyright */}
    </>
  );
};

export default Footer;
