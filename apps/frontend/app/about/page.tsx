import { Layout } from "@/components/layout";
import { Mail, Github, Linkedin, Briefcase, MessageCircle } from "lucide-react";
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
            A passionate tech enthusiast and aspiring software engineer with a
            strong interest in AI/ML, DevOps, and QA automation. Currently
            pursuing BSc. Hons. Computing and Information Systems at
            Sabaragamuwa University.
          </p>
        </section>

        {/* About Me */}
        <section className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold font-sans text-foreground mb-4">
            About Me
          </h2>
          <div className="space-y-4 text-foreground/90 font-serif leading-relaxed">
            <p>
              I'm an entry-level software engineer currently studying at
              Sabaragamuwa University, working towards my BSc. Hons. in
              Computing and Information Systems (graduating in 2027). My passion
              lies in exploring cutting-edge technologies and building practical
              solutions that solve real-world problems.
            </p>
            <p>
              My journey into tech is uniquely complemented by my background as
              an experienced 3D designer with expertise in marketing and content
              creation. This creative foundation has given me a strong eye for
              user experience design and visual storytelling, skills that I now
              apply to building intuitive and engaging digital solutions.
            </p>
            <p>
              I specialize in AI/ML implementations, system maintenance through
              DevOps practices, and quality assurance automation. I love
              experimenting with new technologies and frameworks, always eager
              to learn and implement innovative solutions in my projects.
            </p>
            <p>
              Currently, I'm working as a freelance full-stack developer, taking
              on diverse projects that challenge me to grow my skills. I've also
              collaborated on several group projects during my university
              studies, developing full-stack applications and implementing AI
              agent solutions using n8n for real-world applications.
            </p>
            <p>
              When I'm not coding or studying, you'll find me exploring the
              latest developments in artificial intelligence, experimenting with
              new DevOps tools, or contributing to open-source projects that
              align with my interests in automation and intelligent systems.
            </p>
          </div>
        </section>

        {/* Skills Section */}
        <section className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold font-sans text-foreground mb-6">
            Technical Skills
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Frontend Development
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• React.js & Next.js</li>
                <li>• TypeScript & JavaScript (ES6+)</li>
                <li>• Tailwind CSS & Responsive Design</li>
                <li>• Component Libraries & UI Frameworks</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Backend Development
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• Node.js & Express.js</li>
                <li>• MongoDB & Database Design</li>
                <li>• RESTful APIs & Authentication</li>
                <li>• Server Architecture & Optimization</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                DevOps & Infrastructure
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• Docker & Containerization</li>
                <li>• Terraform & Infrastructure as Code</li>
                <li>• AWS Cloud Services</li>
                <li>• GitHub Actions & CI/CD Pipelines</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                AI/ML & QA Testing
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• n8n AI Agent Implementation</li>
                <li>• Machine Learning Integration</li>
                <li>• Automated Testing Frameworks</li>
                <li>• Quality Assurance Tools & Practices</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Design & Content Creation
              </h3>
              <ul className="space-y-2 text-foreground/90">
                <li>• 3D Modeling & Visualization</li>
                <li>• Marketing Content Creation</li>
                <li>• UI/UX Design Principles</li>
                <li>• Brand Identity & Visual Design</li>
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
            This blog serves as my digital journal where I document my learning
            journey, share project experiences, and explore the fascinating
            world of technology. Here you'll find articles covering:
          </p>
          <ul className="space-y-2 text-foreground/90 mb-4">
            <li>• AI/ML implementation tutorials and case studies</li>
            <li>• DevOps practices and automation strategies</li>
            <li>• Full-stack development with MERN stack</li>
            <li>• Quality assurance and testing methodologies</li>
            <li>• University project showcases and learnings</li>
            <li>• Freelance development experiences and insights</li>
          </ul>
          <p className="text-foreground/90 font-serif leading-relaxed">
            Built with the MERN stack (MongoDB, Express.js, React/Next.js,
            Node.js) and styled with Tailwind CSS, this site demonstrates modern
            full-stack development practices with applying DevOps culture, while
            providing an engaging platform to share knowledge and connect with
            fellow tech enthusiasts.
          </p>
        </section>

        {/* Academic & Professional Journey */}
        <section className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold font-sans text-foreground mb-4">
            Academic & Professional Journey
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                🎓 Education
              </h3>
              <p className="text-foreground/90 font-serif leading-relaxed">
                Currently pursuing BSc. Hons. Computing and Information Systems
                at Sabaragamuwa University (2024-2027). Focused on software
                engineering principles, system design, and emerging technologies
                in computing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                💼 Professional Experience
              </h3>
              <p className="text-foreground/90 font-serif leading-relaxed">
                Working as a freelance full-stack developer and experienced 3D
                designer, delivering custom web applications, AI-powered
                solutions, and marketing content. My background in 3D design and
                content creation brings a unique visual perspective to software
                development, ensuring both functional and aesthetically pleasing
                solutions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                🚀 Notable Projects
              </h3>
              <p className="text-foreground/90 font-serif leading-relaxed">
                Developed real-world AI agent solutions using n8n, contributed
                to university group projects building full-stack applications,
                and continuously exploring new technologies through personal
                projects and open-source contributions.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold font-sans text-foreground mb-4">
            Let's Connect
          </h2>
          <p className="text-foreground/90 font-serif leading-relaxed mb-6">
            I'm always excited to connect with fellow developers, discuss new
            technologies, collaborate on interesting projects, or explore
            industry opportunities. Feel free to reach out!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/94768487278"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-transparent"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
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
          </div>
        </section>
      </div>
    </Layout>
  );
}
