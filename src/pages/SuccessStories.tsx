
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award } from "lucide-react";

const SuccessStories = () => {
  const stories = [
    {
      name: "John M.",
      location: "Portland, OR",
      equipment: "Construction Equipment",
      avatar: "JM",
      story: "I started renting out my unused construction equipment on Needyfy last year. Within 6 months, I earned over $15,000 and expanded my inventory. Now I've turned my idle equipment into a profitable side business.",
      earnings: "$15,000+",
      months: 6
    },
    {
      name: "Sophia L.",
      location: "Austin, TX",
      equipment: "Photography Gear",
      avatar: "SL",
      story: "As a professional photographer, my high-end gear was sitting idle between shoots. Listing on Needyfy helped me earn back my investment in expensive lenses and cameras. The platform's verification system made me feel secure renting to strangers.",
      earnings: "$8,200+",
      months: 4
    },
    {
      name: "Michael T.",
      location: "Chicago, IL",
      equipment: "Audio Equipment",
      avatar: "MT",
      story: "I own a small recording studio and started renting out my portable audio equipment when not in use. The extra income helps cover my studio overhead, and I've connected with many local musicians who have become studio clients.",
      earnings: "$12,500+",
      months: 8
    },
    {
      name: "Lisa R.",
      location: "Miami, FL",
      equipment: "Party Supplies",
      avatar: "LR",
      story: "After hosting my daughter's elaborate birthday party, I realized all the decorations and supplies would just collect dust. I listed them on Needyfy, and the response was overwhelming. I've since expanded into a full party rental business!",
      earnings: "$20,000+",
      months: 12
    },
    {
      name: "David W.",
      location: "Denver, CO",
      equipment: "Outdoor Gear",
      avatar: "DW",
      story: "As an avid camper and hiker, I've accumulated a lot of high-quality gear over the years. Renting it out on Needyfy when I'm not using it has been a game-changer. I've made enough to upgrade my equipment and take longer outdoor adventures.",
      earnings: "$6,800+",
      months: 5
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Provider Success Stories</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Discover how equipment owners like you are turning idle assets into income with Needyfy
        </p>
      </div>
      
      <div className="space-y-8">
        {stories.map((story, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(story.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                    alt={story.name} 
                  />
                  <AvatarFallback className="text-2xl">{story.avatar}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-xl">{story.name}</h3>
                <p className="text-gray-500">{story.location}</p>
                <div className="flex items-center mt-2">
                  <Award className="h-5 w-5 text-needyfy-blue mr-1" />
                  <p className="font-medium">{story.equipment}</p>
                </div>
              </div>
              
              <div className="md:w-2/3 p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="flex items-center gap-2 text-needyfy-blue">
                    Success Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500 text-sm">Earnings</p>
                      <p className="text-2xl font-bold text-needyfy-green">{story.earnings}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500 text-sm">Time Period</p>
                      <p className="text-2xl font-bold">{story.months} months</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700">{story.story}</p>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <a href="/" className="text-needyfy-blue hover:underline font-medium">
          ← Back to Home
        </a>
      </div>
    </div>
  );
};

export default SuccessStories;
