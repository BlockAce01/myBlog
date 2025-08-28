import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MapPin, Calendar } from "lucide-react"

export default function AboutPage() {
  const skills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Express",
    "MongoDB",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "Terraform",
    "CI/CD",
    "Git",
    "Linux",
    "Python",
  ]

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">About Me</h1>
          <p className="text-lg text-muted-foreground">
            Full-stack developer passionate about building scalable, modern web applications
          </p>
        </div>

        {/* Introduction Section */}
        <section className="space-y-6">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Professional Headshot Placeholder */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-muted rounded-full flex items-center justify-center">
                    <img
                      src="/software-developer-headshot.png"
                      alt="Professional headshot"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Bio Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>5+ years experience</span>
                    </div>
                  </div>

                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      I'm a passionate full-stack developer with over 5 years of experience building scalable web
                      applications and cloud infrastructure. My journey in tech started with a curiosity about how
                      websites work, which quickly evolved into a deep fascination with modern development practices,
                      DevOps, and cloud architecture.
                    </p>
                    <p>
                      Currently, I work as a Senior Software Engineer where I lead the development of microservices
                      architectures and implement CI/CD pipelines. I'm particularly interested in the intersection of
                      development and operations, believing that great software requires both excellent code and robust
                      infrastructure. When I'm not coding, you can find me contributing to open-source projects, writing
                      technical articles, or exploring the latest developments in cloud-native technologies.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Skills Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-semibold text-foreground">My Skills</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Frontend Development</h3>
                  <div className="flex flex-wrap gap-2">
                    {["JavaScript", "TypeScript", "React", "Next.js", "HTML5", "CSS3", "Tailwind CSS"].map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Backend Development</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Node.js", "Express", "Python", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST APIs"].map(
                      (skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">DevOps & Cloud</h3>
                  <div className="flex flex-wrap gap-2">
                    {["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "GitHub Actions", "Linux"].map(
                      (skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Tools & Methodologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Git", "Agile", "Scrum", "TDD", "Microservices", "System Design", "Code Review"].map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* About This Site Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-semibold text-foreground">About This Site</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                This blog is a portfolio piece that showcases my expertise in modern web development and DevOps
                practices. Built with Next.js, TypeScript, and Tailwind CSS, it demonstrates my approach to creating
                scalable, maintainable applications with clean architecture and responsive design. The site features a
                custom dark mode implementation, optimized performance, and follows accessibility best practices. It
                serves as both a platform for sharing my technical insights and a demonstration of the development
                methodologies I advocate for in my professional work.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-semibold text-foreground">Contact</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-5 w-5" />
                <span>
                  Feel free to reach out to me at{" "}
                  <a
                    href="mailto:hello@yourdomain.com"
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    hello@yourdomain.com
                  </a>
                </span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  )
}
