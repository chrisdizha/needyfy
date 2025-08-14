
const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">About Us</h1>
      <div className="prose max-w-none">
        <p className="mb-4">
          We are a leading equipment rental platform connecting equipment owners with people who need to rent tools and equipment.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">Our Mission</h2>
        <p className="mb-4">
          To make equipment access more affordable and sustainable by connecting communities through sharing.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">How It Works</h2>
        <p className="mb-4">
          Equipment owners can list their tools and equipment for rent, while renters can easily find and book what they need nearby.
        </p>
      </div>
    </div>
  );
};

export default About;
