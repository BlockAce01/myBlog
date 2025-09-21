import { Layout } from "@/components/layout";
import { Mail, Github, Linkedin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Introduction Section */}
        <section className="text-center">
          <Avatar className="w-32 h-32 mx-auto mb-6">
            <AvatarImage
              src="/avatars/me.jpg"
              alt="Yugan"
              className="object-cover"
            />
          </Avatar>
          <h1 className="text-4xl font-bold font-sans text-foreground mb-4">
            Hi, I'm Yugan
          </h1>
          <p className="text-xl text-muted-foreground font-serif leading-relaxed">
            A passionate full-stack developer with over 8 years of experience
            building scalable web applications and sharing knowledge through
            writing and open source contributions.
          </p>
        </section>

        {/* About Me */}
        <section className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold font-sans text-foreground mb-4">
            About Me
          </h2>
          <div className="space-y-4 text-foreground/90 font-serif leading-relaxed">
            <p>
              I'm a senior software engineer currently working at a leading tech
              company, where I focus on building high-performance web
              applications using modern JavaScript frameworks and cloud
              technologies.
            </p>
            <p>
              My journey in tech started over a decade ago, and I've had the
              privilege of working with startups and enterprise companies alike.
              I'm passionate about clean code, system architecture, and
              mentoring the next generation of developers.
            </p>
            <p>
              When I'm not coding, you can find me contributing to open source
              projects, writing technical articles, or exploring the latest
              developments in web technologies and DevOps practices.
            </p>
          </div>
        </section>

        {/* Skills Section */}
        <section className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold font-sans text-foreground mb-6">
            Technical Skills
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Frontend Development
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• React.js & Next.js</li>
                <li>• TypeScript & JavaScript (ES6+)</li>
                <li>• Tailwind CSS & Styled Components</li>
                <li>• State Management (Redux, Zustand)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Backend Development
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• Node.js & Express.js</li>
                <li>• MongoDB & PostgreSQL</li>
                <li>• RESTful APIs & GraphQL</li>
                <li>• Authentication & Authorization</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                DevOps & Tools
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• Docker & Kubernetes</li>
                <li>• AWS & Vercel</li>
                <li>• CI/CD Pipelines</li>
                <li>• Git & GitHub Actions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Other Technologies
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• Python & Django</li>
                <li>• Redis & Elasticsearch</li>
                <li>• Testing (Jest, Cypress)</li>
                <li>• Monitoring & Analytics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About This Site */}
        <section className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold font-sans text-foreground mb-4">
            About This Site
          </h2>
          <p className="text-foreground/90 font-serif leading-relaxed mb-4">
            This blog serves as a platform for me to share my experiences,
            insights, and learnings in the world of software development. Here
            you'll find articles covering:
          </p>
          <ul className="space-y-2 text-foreground/90 mb-4">
            <li>• Modern web development practices and patterns</li>
            <li>• Deep dives into JavaScript frameworks and libraries</li>
            <li>• DevOps and deployment strategies</li>
            <li>• Career advice and industry insights</li>
            <li>• Open source project showcases</li>
          </ul>
          <p className="text-foreground/90 font-serif leading-relaxed">
            Built with Next.js 14, TypeScript, and Tailwind CSS, this site
            demonstrates modern web development practices while providing a
            clean, accessible reading experience.
          </p>
        </section>

        {/* Contact Section */}
        <section className="bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold font-sans text-foreground mb-4">
            Let's Connect
          </h2>
          <p className="text-foreground/90 font-serif leading-relaxed mb-6">
            I'm always interested in connecting with fellow developers,
            discussing new opportunities, or collaborating on interesting
            projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:yugankavinda@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-transparent"
              >
                <Mail className="w-5 h-5" />
                <span>yugankavinda@gmail.com</span>
              </Button>
            </a>
            <a
              href="https://github.com/BlockAce01"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-transparent"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </Button>
            </a>
            <a
              href="https://www.linkedin.com/in/theekshana-yugan"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-transparent"
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </Button>
            </a>
            <a
              href="https://www.fiverr.com/yugan_3d"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-transparent"
              >
                <Briefcase className="w-5 h-5" />
                <span>Fiverr</span>
              </Button>
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
