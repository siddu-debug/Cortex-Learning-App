import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mx-auto max-w-2xl w-full px-5 py-16 flex-1 prose-cortex">
        <h1>Contribution guidelines</h1>
        <p>Cortex only works if forks and edits actually improve the graph. A few ground rules:</p>
        <ul>
          <li><strong>Ground it.</strong> Lessons should trace back to a real source — cite what you added or changed.</li>
          <li><strong>Fork instead of fighting.</strong> Disagree with a course? Fork it and make your case with a better version, rather than editing someone else&apos;s original without consent.</li>
          <li><strong>Write commit messages that mean something.</strong> &quot;Fixed typo in Big-O lesson&quot; beats &quot;update&quot;.</li>
          <li><strong>Review honestly.</strong> Ratings and reviews are how the community surfaces the best forks — don&apos;t rate your own courses.</li>
          <li><strong>No plagiarized or copyrighted text.</strong> Paraphrase and cite; don&apos;t paste in copyrighted material wholesale.</li>
        </ul>
      </div>
      <Footer />
    </div>
  );
}
