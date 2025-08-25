# 2. Requirements

### Functional Requirements

*   **FR1:** The system shall provide a public-facing, responsive web interface to display a list of blog posts.
*   **FR2:** Each blog post in the list must display its title, a summary or excerpt, and the publication date.
*   **FR3:** Users shall be able to click on a blog post from the list to navigate to a dedicated, full-page view of that article.
*   **FR4:** The system shall include an "About Me" page containing biographical information, a summary of technical skills, and contact information.
*   **FR5:** The system must provide a secure, private interface (or mechanism) for the blog owner to perform Create, Read, Update, and Delete (CRUD) operations on blog posts.
*   **FR6:** The system shall be architected using microservices, with at least a separate service for blog post management and another for future authentication/user management.
*   **FR7:** The system shall track and display a view count for each individual blog post.
*   **FR8:** The system shall allow anonymous users to "like" a blog post.
*   **FR9:** The system shall display the total number of likes for each blog post.
*   **FR10:** The system shall allow anonymous users to submit a comment on a blog post, providing a name and the comment text.
*   **FR11:** The system shall display all comments associated with a blog post.
*   **FR12:** The system shall make a best-effort attempt to prevent a user from liking the same post multiple times from the same browser (e.g., using local storage).
*   **FR13:** The blog owner shall be able to assign one or more tags to each blog post during its creation or editing.
*   **FR14:** The public-facing website shall display all assigned tags on the homepage (e.g., as a filter bar) and on individual blog post pages.
*   **FR15:** Users shall be able to filter blog posts by selecting one or more tags from the homepage, displaying only the posts associated with the selected tags.

### Non-Functional Requirements

*   **NFR1:** The entire infrastructure on AWS must be defined and managed as code using **Terraform**.
*   **NFR2:** All application components (frontend, backend services) must be containerized using **Docker**.
*   **NFR3:** The system must have a fully automated CI/CD pipeline managed by **GitHub Actions**. The pipeline must trigger on a push to the `main` branch and automatically build, test, and deploy the application to the AWS environment.
*   **NFR4:** The server-side environment and configuration must be managed using **Ansible**.
*   **NFR5:** The frontend application must be built using **React**.
*   **NFR6:** The backend microservices must be built using **Node.js** and **Express.js**.
*   **NFR7:** The primary data store for blog content shall be **MongoDB**.
*   **NFR8:** The entire project must be designed to operate within the cost limits of the **AWS Free Tier**.
*   **NFR9:** The application must be secure, protecting the content management interface from unauthorized access.
