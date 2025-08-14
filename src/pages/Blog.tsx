
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, User } from "lucide-react";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Essential Safety Guidelines for Equipment Rental",
      excerpt: "Learn the fundamental safety practices every renter should follow to ensure safe equipment usage and prevent accidents.",
      author: "Safety Team",
      date: "2024-01-15",
      readTime: "8 min read",
      category: "Safety",
      image: "/placeholder.svg",
      content: `
        <h2>Why Equipment Safety Matters</h2>
        <p>Equipment rental safety is paramount to protecting both renters and equipment owners. Every year, thousands of accidents occur due to improper equipment handling, making safety education crucial for all parties involved.</p>
        
        <h3>Pre-Rental Safety Checks</h3>
        <p>Before accepting any rental equipment, conduct a thorough inspection:</p>
        <ul>
          <li>Check for visible damage, wear, or defects</li>
          <li>Verify all safety features are functional</li>
          <li>Ensure all required accessories are included</li>
          <li>Test basic operations if possible</li>
          <li>Review the equipment manual or operation guide</li>
        </ul>
        
        <h3>Personal Protective Equipment (PPE)</h3>
        <p>Always wear appropriate PPE when operating rental equipment:</p>
        <ul>
          <li>Safety glasses or goggles for eye protection</li>
          <li>Hard hats for overhead hazard protection</li>
          <li>Steel-toed boots for foot protection</li>
          <li>Work gloves for hand protection</li>
          <li>Hearing protection for loud equipment</li>
        </ul>
        
        <h3>Safe Operation Practices</h3>
        <p>Follow these guidelines during equipment use:</p>
        <ul>
          <li>Read and understand all operating instructions</li>
          <li>Never exceed the equipment's rated capacity</li>
          <li>Maintain proper posture and stance</li>
          <li>Keep work areas clean and well-lit</li>
          <li>Never operate equipment while fatigued or impaired</li>
        </ul>
        
        <h3>Emergency Procedures</h3>
        <p>Be prepared for emergencies by:</p>
        <ul>
          <li>Knowing how to quickly shut off equipment</li>
          <li>Having emergency contact numbers readily available</li>
          <li>Understanding first aid basics</li>
          <li>Keeping fire extinguishers nearby when applicable</li>
        </ul>
        
        <h3>Post-Use Safety</h3>
        <p>After completing your rental period:</p>
        <ul>
          <li>Clean equipment according to guidelines</li>
          <li>Store equipment safely until return</li>
          <li>Report any incidents or near-misses</li>
          <li>Document any equipment issues discovered</li>
        </ul>
      `
    },
    {
      id: 2,
      title: "Equipment Maintenance Best Practices for Owners",
      excerpt: "Comprehensive guide on maintaining rental equipment to ensure longevity, safety, and maximum return on investment.",
      author: "Maintenance Team",
      date: "2024-01-12",
      readTime: "12 min read",
      category: "Maintenance",
      image: "/placeholder.svg",
      content: `
        <h2>The Importance of Regular Maintenance</h2>
        <p>Proper maintenance is the backbone of a successful equipment rental business. Well-maintained equipment not only lasts longer but also ensures renter safety and satisfaction, leading to better reviews and repeat business.</p>
        
        <h3>Preventive Maintenance Schedules</h3>
        <p>Establish regular maintenance schedules based on:</p>
        <ul>
          <li>Manufacturer recommendations</li>
          <li>Usage frequency and intensity</li>
          <li>Environmental conditions</li>
          <li>Age and condition of equipment</li>
        </ul>
        
        <h3>Daily Maintenance Checks</h3>
        <p>Before each rental, perform these checks:</p>
        <ul>
          <li>Visual inspection for obvious damage</li>
          <li>Fluid level checks (oil, hydraulic fluid, coolant)</li>
          <li>Tire pressure and condition</li>
          <li>Battery terminals and connections</li>
          <li>Safety system functionality</li>
        </ul>
        
        <h3>Weekly Maintenance Tasks</h3>
        <p>Perform these tasks weekly or after every few rentals:</p>
        <ul>
          <li>Clean air filters</li>
          <li>Grease lubrication points</li>
          <li>Check belt tension and condition</li>
          <li>Inspect electrical connections</li>
          <li>Test emergency stops and safety features</li>
        </ul>
        
        <h3>Monthly Deep Maintenance</h3>
        <p>Monthly maintenance should include:</p>
        <ul>
          <li>Oil and filter changes</li>
          <li>Hydraulic system inspection</li>
          <li>Brake system checks</li>
          <li>Structural integrity assessment</li>
          <li>Calibration of precision instruments</li>
        </ul>
        
        <h3>Seasonal Maintenance</h3>
        <p>Adjust maintenance based on seasons:</p>
        <ul>
          <li>Winter: Antifreeze levels, battery performance</li>
          <li>Spring: Post-winter damage assessment</li>
          <li>Summer: Cooling system efficiency</li>
          <li>Fall: Preparation for storage or reduced usage</li>
        </ul>
        
        <h3>Record Keeping</h3>
        <p>Maintain detailed records of:</p>
        <ul>
          <li>All maintenance performed</li>
          <li>Parts replaced and costs</li>
          <li>Performance issues noted</li>
          <li>Rental history and usage hours</li>
        </ul>
      `
    },
    {
      id: 3,
      title: "Building Trust Through Equipment Verification",
      excerpt: "How proper verification processes protect both renters and owners while building a trustworthy marketplace.",
      author: "Trust & Safety",
      date: "2024-01-10",
      readTime: "10 min read",
      category: "Verification",
      image: "/placeholder.svg",
      content: `
        <h2>The Foundation of Trust in Equipment Rental</h2>
        <p>Trust is the cornerstone of successful equipment rental transactions. Both renters and owners need confidence that they're dealing with legitimate, responsible parties and quality equipment.</p>
        
        <h3>Equipment Documentation</h3>
        <p>Proper documentation builds confidence:</p>
        <ul>
          <li>Purchase receipts and warranty information</li>
          <li>Service and maintenance records</li>
          <li>Safety inspection certificates</li>
          <li>Insurance documentation</li>
          <li>Operating manuals and specifications</li>
        </ul>
        
        <h3>Photo Verification Standards</h3>
        <p>High-quality photos should show:</p>
        <ul>
          <li>Multiple angles of the equipment</li>
          <li>Serial numbers and model information</li>
          <li>Current condition and any wear marks</li>
          <li>All included accessories</li>
          <li>Equipment in operation (if safe to do so)</li>
        </ul>
        
        <h3>Identity Verification for Users</h3>
        <p>Verify user identities through:</p>
        <ul>
          <li>Government-issued ID verification</li>
          <li>Address confirmation</li>
          <li>Phone number verification</li>
          <li>Email address confirmation</li>
          <li>Professional references when applicable</li>
        </ul>
        
        <h3>Insurance and Liability Protection</h3>
        <p>Ensure adequate protection through:</p>
        <ul>
          <li>Proof of insurance coverage</li>
          <li>Liability waivers and agreements</li>
          <li>Security deposits or bonds</li>
          <li>Clear damage assessment procedures</li>
        </ul>
        
        <h3>Building Reputation Systems</h3>
        <p>Implement systems that track:</p>
        <ul>
          <li>User ratings and reviews</li>
          <li>Transaction history</li>
          <li>Response times and communication quality</li>
          <li>Equipment condition accuracy</li>
          <li>Dispute resolution outcomes</li>
        </ul>
        
        <h3>Red Flags to Watch For</h3>
        <p>Be cautious of:</p>
        <ul>
          <li>Reluctance to provide verification documents</li>
          <li>Unusually low prices for high-value equipment</li>
          <li>Poor quality or limited photos</li>
          <li>Pressure for immediate transactions</li>
          <li>Communication only through untraceable methods</li>
        </ul>
      `
    },
    {
      id: 4,
      title: "Smart Pricing Strategies for Equipment Owners",
      excerpt: "Optimize your rental income with data-driven pricing strategies that balance profitability with market competitiveness.",
      author: "Business Development",
      date: "2024-01-08",
      readTime: "15 min read",
      category: "Business",
      image: "/placeholder.svg",
      content: `
        <h2>Understanding Equipment Rental Pricing</h2>
        <p>Pricing rental equipment effectively requires balancing multiple factors: market demand, equipment costs, competition, and desired profit margins. Strategic pricing can significantly impact your rental business success.</p>
        
        <h3>Cost-Based Pricing Foundation</h3>
        <p>Start with understanding your costs:</p>
        <ul>
          <li>Initial equipment purchase price</li>
          <li>Annual maintenance and repair costs</li>
          <li>Storage and insurance expenses</li>
          <li>Depreciation rates</li>
          <li>Platform fees and transaction costs</li>
        </ul>
        
        <h3>Market Research and Competitive Analysis</h3>
        <p>Research your local market:</p>
        <ul>
          <li>Survey competitor pricing for similar equipment</li>
          <li>Identify unique value propositions</li>
          <li>Understand seasonal demand patterns</li>
          <li>Analyze customer willingness to pay</li>
          <li>Consider geographic market differences</li>
        </ul>
        
        <h3>Dynamic Pricing Strategies</h3>
        <p>Implement flexible pricing based on:</p>
        <ul>
          <li>Seasonal demand variations</li>
          <li>Day of week preferences</li>
          <li>Rental duration (discounts for longer rentals)</li>
          <li>Last-minute availability</li>
          <li>Repeat customer incentives</li>
        </ul>
        
        <h3>Value-Added Services Pricing</h3>
        <p>Consider additional revenue streams:</p>
        <ul>
          <li>Delivery and pickup services</li>
          <li>Equipment setup and training</li>
          <li>Extended warranty options</li>
          <li>Emergency replacement guarantees</li>
          <li>Package deals for multiple items</li>
        </ul>
        
        <h3>Psychological Pricing Techniques</h3>
        <p>Use pricing psychology:</p>
        <ul>
          <li>Charm pricing (ending in 9 or 5)</li>
          <li>Anchor pricing with premium options</li>
          <li>Bundle pricing for related equipment</li>
          <li>Tiered pricing structures</li>
          <li>Limited-time promotional pricing</li>
        </ul>
        
        <h3>Performance Monitoring and Adjustment</h3>
        <p>Track key metrics:</p>
        <ul>
          <li>Booking rate vs. price points</li>
          <li>Revenue per rental period</li>
          <li>Customer acquisition costs</li>
          <li>Profit margins by equipment type</li>
          <li>Return on investment timelines</li>
        </ul>
      `
    },
    {
      id: 5,
      title: "Effective Communication in Equipment Rentals",
      excerpt: "Master the art of clear communication to prevent misunderstandings, build trust, and ensure successful rental experiences.",
      author: "Customer Success",
      date: "2024-01-05",
      readTime: "7 min read",
      category: "Communication",
      image: "/placeholder.svg",
      content: `
        <h2>The Power of Clear Communication</h2>
        <p>Effective communication is the key to successful equipment rentals. Clear, timely, and professional communication prevents misunderstandings, builds trust, and creates positive experiences for all parties involved.</p>
        
        <h3>Pre-Rental Communication</h3>
        <p>Set clear expectations from the start:</p>
        <ul>
          <li>Detailed equipment descriptions and capabilities</li>
          <li>Clear pricing structure and additional fees</li>
          <li>Availability calendars and booking procedures</li>
          <li>Pickup and return logistics</li>
          <li>Required documentation and preparations</li>
        </ul>
        
        <h3>During the Rental Process</h3>
        <p>Maintain open communication channels:</p>
        <ul>
          <li>Prompt responses to inquiries (within 2-4 hours)</li>
          <li>Confirmation of booking details</li>
          <li>Reminders about pickup/delivery times</li>
          <li>Check-ins during longer rental periods</li>
          <li>Immediate notification of any issues</li>
        </ul>
        
        <h3>Professional Communication Standards</h3>
        <p>Maintain professionalism through:</p>
        <ul>
          <li>Courteous and respectful tone</li>
          <li>Clear, concise messaging</li>
          <li>Proper grammar and spelling</li>
          <li>Timely responses to all communications</li>
          <li>Patience with questions and concerns</li>
        </ul>
        
        <h3>Handling Difficult Conversations</h3>
        <p>When issues arise:</p>
        <ul>
          <li>Listen actively to understand concerns</li>
          <li>Acknowledge problems without defensiveness</li>
          <li>Propose practical solutions</li>
          <li>Follow up to ensure resolution</li>
          <li>Learn from feedback for future improvements</li>
        </ul>
        
        <h3>Documentation and Record Keeping</h3>
        <p>Keep records of all communications:</p>
        <ul>
          <li>Booking confirmations and modifications</li>
          <li>Condition reports and agreements</li>
          <li>Issue reports and resolutions</li>
          <li>Customer feedback and reviews</li>
          <li>Any disputes or claims</li>
        </ul>
        
        <h3>Building Long-Term Relationships</h3>
        <p>Foster repeat business through:</p>
        <ul>
          <li>Personalized service and recognition</li>
          <li>Proactive equipment suggestions</li>
          <li>Loyalty programs and repeat customer benefits</li>
          <li>Regular follow-ups and satisfaction checks</li>
          <li>Sharing relevant industry insights</li>
        </ul>
      `
    },
    {
      id: 6,
      title: "Insurance and Liability in Equipment Rental",
      excerpt: "Navigate the complex world of equipment rental insurance to protect your business and provide peace of mind to customers.",
      author: "Legal & Insurance",
      date: "2024-01-03",
      readTime: "11 min read",
      category: "Insurance",
      image: "/placeholder.svg",
      content: `
        <h2>Understanding Equipment Rental Insurance</h2>
        <p>Insurance and liability protection are critical components of equipment rental operations. Proper coverage protects both equipment owners and renters from financial losses due to accidents, theft, or damage.</p>
        
        <h3>Types of Insurance Coverage</h3>
        <p>Essential insurance types for equipment rental:</p>
        <ul>
          <li>General liability insurance</li>
          <li>Equipment and property insurance</li>
          <li>Commercial auto insurance (for delivery)</li>
          <li>Professional liability insurance</li>
          <li>Workers' compensation (if applicable)</li>
        </ul>
        
        <h3>Owner Protection Strategies</h3>
        <p>Equipment owners should consider:</p>
        <ul>
          <li>Comprehensive equipment insurance policies</li>
          <li>Theft and vandalism coverage</li>
          <li>Business interruption insurance</li>
          <li>Umbrella liability policies</li>
          <li>Regular policy reviews and updates</li>
        </ul>
        
        <h3>Renter Responsibilities and Coverage</h3>
        <p>Renters should understand:</p>
        <ul>
          <li>Their liability for equipment damage</li>
          <li>Required insurance minimums</li>
          <li>Additional coverage options</li>
          <li>Proper handling and care requirements</li>
          <li>Reporting procedures for incidents</li>
        </ul>
        
        <h3>Risk Assessment and Mitigation</h3>
        <p>Identify and manage risks through:</p>
        <ul>
          <li>Thorough renter screening processes</li>
          <li>Equipment condition documentation</li>
          <li>Safety training and orientation</li>
          <li>Regular equipment inspections</li>
          <li>Clear usage guidelines and restrictions</li>
        </ul>
        
        <h3>Claim Procedures and Documentation</h3>
        <p>When incidents occur:</p>
        <ul>
          <li>Immediate notification to insurance providers</li>
          <li>Detailed incident documentation</li>
          <li>Photo evidence of damage</li>
          <li>Witness statements when available</li>
          <li>Cooperation with insurance investigations</li>
        </ul>
        
        <h3>Legal Considerations</h3>
        <p>Important legal aspects include:</p>
        <ul>
          <li>Liability waivers and their limitations</li>
          <li>State and local insurance requirements</li>
          <li>Indemnification clauses</li>
          <li>Dispute resolution procedures</li>
          <li>Regular legal review of agreements</li>
        </ul>
      `
    }
  ];

  const [selectedPost, setSelectedPost] = React.useState(null);

  if (selectedPost) {
    const post = blogPosts.find(p => p.id === selectedPost);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="outline" 
            onClick={() => setSelectedPost(null)}
            className="mb-6"
          >
            ← Back to Blog
          </Button>
          
          <article className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Badge className="mb-4">{post.category}</Badge>
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            
            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-4">
                Join thousands of equipment owners and renters who trust our platform for safe, reliable rentals.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to="/register">Start Renting</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/list-equipment">List Equipment</Link>
                </Button>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Equipment Rental Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert insights, tips, and best practices for equipment rental success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedPost(post.id)}>
              <div className="aspect-video bg-muted rounded-t-lg mb-4"></div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-sm text-muted-foreground">{post.readTime}</span>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-semibold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-6">
            Get the latest tips and insights delivered to your inbox
          </p>
          <div className="flex gap-4 justify-center max-w-md mx-auto">
            <Button asChild>
              <Link to="/register">Join Our Community</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
