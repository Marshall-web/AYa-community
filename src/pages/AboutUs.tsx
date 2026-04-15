import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target, Award, Shield, GraduationCap, Activity, Home } from "lucide-react";
import backgroundImg from "@/assets/background.jpg";

export default function AboutUs() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img
          src={backgroundImg}
          alt="About AYA Community Centre"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <span className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-sm mb-4">
              Who we are
            </span>
            <h1 className="font-display text-3xl md:text-6xl font-bold mb-4">Caring for Those Who Cared for Us</h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="shadow-medium">
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                The <strong>AYA COMMUNITY CENTRE</strong>, (ACC) is a care centre focused on promoting and encouraging the healthcare and wellbeing of the children and elderly in <strong>Ampain, in the Ellemebelle district</strong>. The ACC has been set up, to serve as a <strong>safe and secure place</strong> for the elderly in the community. The focus is to <strong>reduce the burden on the lives of both attendants and families</strong> by providing quality day care. The youth centre would provide a place where the young people of the community could gather to partake in sporting activities.
              </p>

              <div className="bg-accent/10 rounded-lg p-6 mb-6">
                <h3 className="font-display text-xl font-semibold mb-4">The advantages of the center will be:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    <span>To provide older adults an opportunity to get out of the house and receive both mental and social stimulation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    <span>To give 'caregivers' the opportunity to attend to personal needs or work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent font-bold mt-1">•</span>
                    <span>To have a recreational area where youth could participate in various activities.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary/5 rounded-lg p-6 border-l-4 border-accent">
                <p className="text-muted-foreground leading-relaxed mb-3">
                  The community center is named after <strong>Hon. Emmanuel A.K. Buah's mother, Madam Aya Buah</strong> who embodies the virtues of what the center stands for.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  In Hebrew, the name <strong>AYA</strong> represents people who tend to be compassionate, humanitarian, and generous. They usually tend to follow professions where they can serve humanity. In Ghana, the name Aya also stands for an African Adinkra symbol which is a fern; a symbol of endurance and resourcefulness.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aims & Objectives */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="section-title mb-4">Aims & Objectives</h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-medium">
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  The main aim of the ACC is to offer a unique experience, which caters to the <strong>physical, spiritual, social and emotional well-being</strong> of both the elderly and the children. To serve as a <strong>safe and secure haven</strong>, knowing that every day they are guaranteed great health care, food and companionship.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Due to the physical, psychological and emotional problems of old age, the feeling of loneliness and frustration has become very common amongst the elderly population. This center we hope, would improve the quality of life of the elderly people through <strong>supportive health care, group activities, counseling, recreational activities and learning new skills</strong>.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Major programs and activities that would be organized include <strong>free healthcare</strong> provided by the mobile clinic and medical community clinics, incorporating periodic health care screening and free medication. Recreational programs would include physical activities to keep them busy and mobile.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-accent" />
                Mission Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To enrich the lives of the people in the community by promoting and providing comfort through <strong>healthcare, education and supervised activities</strong>.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-accent" />
                Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our vision is to become the <strong>leading day care and recreational provider in the region</strong>, through the provision of good health care, education and support. We will provide the right care, at the right time, in the right setting for our people.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="section-title mb-4">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="text-center hover:shadow-medium transition-all">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Passion</h3>
                <p className="text-muted-foreground">
                  The elderly are the reason we have life, the youth are our future: – the reason for our existence and they come first in everything we do.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-medium transition-all">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  We believe in making sure we give our best to attain the highest standards in all we do.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-medium transition-all">
              <CardContent className="p-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Respect</h3>
                <p className="text-muted-foreground">
                  We respect each other, we respect the work we do and we make sure we respect the people we serve.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}

