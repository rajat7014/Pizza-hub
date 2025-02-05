import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const imageProp = ["pizza", "burger", "milkshake"];

function CarouselComponent() {
  return (
    <Carousel
      autoPlay
      navButtonsAlwaysVisible
      infiniteLoop
      showStatus={false}
      emulateTouch
      showThumbs={false}
    >
      {imageProp.map((image, index) => {
        return (
          <div
            key={index}
            style={{ maxHeight: "36rem" }}
            className="object-center brightness-50"
          >
            <img
              src="https://th.bing.com/th/id/OIP.YKn0QOkg9GvS2_bIHIJWpgHaEx?w=273&h=180&c=7&r=0&o=5&dpr=1.1&pid=1.7"
              alt="pizza"
            />
          </div>
        );
      })}
    </Carousel>
  );
}

export default CarouselComponent;