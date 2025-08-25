# App Flow Document for Ed's Personal Portfolio Website

## Onboarding and Sign-In/Sign-Up

A visitor reaches the portfolio by entering the website URL or clicking a link shared by Ed. There is no registration or login required. Every page is publicly accessible and there is no sign-in or sign-out process. The site welcomes the user immediately on the landing page, and no forgotten password or account recovery flows are present because user accounts do not exist in this application.

## Main Dashboard or Home Page

The homepage presents a navigation bar at the top with links labeled Home, Projects, Case Studies, Blog, and Contact. Below the navigation bar is a hero section that introduces Ed by name and profession, with a brief summary of skills or specialties. Further down, a preview of featured projects or case studies may appear as a series of cards or sections. Each preview includes a title, image or thumbnail, and a short description. The footer at the bottom contains contact details and links to social profiles. From this homepage, the user can move to any major section by clicking the corresponding link in the navigation bar or clicking directly on a preview card.

## Detailed Feature Flows and Page Transitions

When the user clicks the Projects link in the navigation bar, the Projects index page loads. While the content is fetched, a section-specific loading indicator appears in place of the project list. Once the data arrives, the page displays a grid or list of project cards, each showing a thumbnail, project title, and short summary. If the user selects one of these cards, the application navigates to the project detail page using a dynamic URL path that includes the project’s unique identifier. On the detail page, the user sees a full project description, images or galleries, technologies used, and outcomes or results. A back link or the main navigation allows the user to return to the Projects index or any other section.

A similar flow applies to Case Studies. Clicking the Case Studies link brings up a loading indicator followed by a list of case study entries. Each entry shows a representative image, title, and teaser text. Selecting an entry navigates to its dynamic detail page, which breaks down the challenge, methodology, and results. The user can use the site navigation or a back button to return to the index.

The Blog section follows the same pattern. The Blog index page first displays a loading spinner, then a list of articles with titles, publication dates, and excerpts. When the user clicks an article, the URL changes to include the blog post’s identifier and the full article content appears, complete with headings, text, and any images or code snippets. Navigation links at the top or bottom of the article page allow the user to return to the Blog index or move to another section.

When the user chooses Contact, they are taken to a page with a form that asks for the user’s name, email address, and message. After the user fills in the fields and presses the submit button, a client-side loader appears while the form data is sent via a POST request to the serverless API endpoint. If the submission succeeds, the form area is replaced by a confirmation message thanking the user. If the submission fails, an inline error message appears with a prompt to retry, and the user can resubmit the form.

## Settings and Account Management

This application does not include user authentication or account settings. Visitors do not create personal accounts and therefore cannot update personal information or notification preferences. There is no billing or subscription management, and no administration panel is exposed to general visitors. All interactions are read-only except for the contact form, which lives on the public Contact page.

## Error States and Alternate Paths

If a visitor attempts to navigate to a project, case study, or blog post that does not exist, the application displays a 404-style message indicating the content could not be found, along with a link to return to the homepage. During data fetching, if the network connection is lost or if the server returns an error, the loading indicator is replaced by a friendly error notice informing the user and suggesting a page reload. In the contact form flow, validation checks run on required fields; if the user leaves a required field blank or enters an invalid email, an inline validation message highlights the issue before the form is submitted. If the API returns an error during form submission, a separate error message appears below the form and the user can correct the inputs or try again.

## Conclusion and Overall App Journey

A visitor’s journey begins on the publicly accessible homepage, where they learn about Ed and see previews of work. From there, they can explore the Projects, Case Studies, and Blog sections using clear navigation links or preview cards. Each section uses dynamic routing and loading indicators to fetch content and display detailed pages for individual items. The final step in a typical visitor’s journey is the Contact page, where they can send a direct message to Ed through a simple form and receive confirmation of their submission. Throughout the experience, the site remains fast and responsive, guiding the user from overview to deep dive and back with intuitive links and clear feedback at each stage of interaction.