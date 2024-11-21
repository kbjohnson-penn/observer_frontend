"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";

const Footer = () => (
  <footer className="bg-nav-background text-white p-4 md:p-6 lg:p-8 mt-auto">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <h2 className="text-lg font-bold text-gray-200">Contact Us</h2>
          <h3 className="text-md text-gray-300">The OBSERVER Project</h3>
          <p className="text-sm mt-2 text-gray-400">
            B202 Richards Medical Research Laboratories
            <br />
            3700 Hamilton Walk
            <br />
            University of Pennsylvania
            <br />
            Philadelphia, PA 19104-6116
          </p>
          <div className="mt-2">
            <span className="block">
              <FontAwesomeIcon icon={faPhone} className="text-gray-400 mr-2" />
              <a href="tel:+1-2155735885" className="text-sm text-yellow-500">
                (215) 573-5885
              </a>
            </span>
            <span className="block mt-2">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-gray-400 mr-2"
              />
              <a
                href="mailto:observerproject@pennmedicine.upenn.edu"
                className="text-sm text-yellow-500"
              >
                Email Us
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
