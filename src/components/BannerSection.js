import React from 'react';

const BannerSection = () => {
  return (
    <section 
      className="w-screen h-[150px] mb-0 flex justify-center items-center gap-2.5 bg-cover bg-center"
      style={{
        backgroundImage: "url('/registrateAhora.webp')",
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        width: '100vw'
      }}
    >
      <a href="/search" className="w-full h-full flex justify-end items-center pr-8">
      
      </a>
    </section>
  );
};

export default BannerSection;