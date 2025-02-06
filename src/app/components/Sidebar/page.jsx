import { MoreHorizontal, Search } from "lucide-react";
import styles from "./page.module.css";
const Sidebar = () => {
  const footerLinks = [
    "Terms of Service",
    "Privacy Policy",
    "Cookie Policy",
    "Accessibility",
    "Ads info",
    "More",
  ];
  const trendingData = [
    {
      category: "Business and finance - Trending",
      topic: "$PAW",
      posts: "2,164 posts",
    },
    {
      category: "Business and finance - Trending",
      topic: "$PAW",
      posts: "2,164 posts",
    },
    {
      category: "Business and finance - Trending",
      topic: "$PAW",
      posts: "2,164 posts",
    },
  ];
  const followData = [
    { name: "Manchester Unit...", handle: "@ManUtdWomen" },
    { name: "Manchester Unit..", handle: "@MU.Foundation" },
    { name: "Fabrizio Romano", handle: "@FabrizioRomano" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <Search size={15} />
        </div>
        <input type="text" placeholder="Search" className={styles.searchBar} />
      </div>
      <div className={styles.subscribe}>
        <h3>Subscribe to Premium</h3>
        <p>
          Subscribe to unlock new features and if eligible, receive a share of
          revenue.
        </p>
        <button>Subscribe</button>
      </div>

      <div className={styles.trendingSection}>
        <h2>What’s happening</h2>
        {trendingData.map((item, index) => (
          <TrendingSuggestion
            key={index}
            category={item.category}
            topic={item.topic}
            posts={item.posts}
          />
        ))}
        <button className={styles.showMore}>Show more</button>
      </div>

      <div className={styles.whoToFollow}>
        <h2>Who to follow</h2>
        {followData.map((item, index) => (
          <FollowSuggestion key={index} name={item.name} handle={item.handle} />
        ))}
        <button className={styles.showMore}>Show more</button>
      </div>
      <div className={styles.footer}>
        {footerLinks.map((link, index) => (
          <a key={index} href="#">{link}</a>
        ))}
        <span>© 2025 X Corp.</span>
      </div>
    </div>
  );
};

function FollowSuggestion({ name, handle }) {
  return (
    <div className={styles.followContainer}>
      <div className={styles.followSuggestion}>
        <span className={styles.name}>{name}</span>
        <span className={styles.handle}>{handle}</span>
      </div>
      <button className={styles.followButton}>Follow</button>
    </div>
  );
}

function TrendingSuggestion({ category, topic, posts }) {
  return (
    <div className={styles.trendingContainer}>
      <div className={styles.trendingSuggestion}>
        <span className={styles.category}>{category}</span>
        <span className={styles.topic}>{topic}</span>
        {posts && <span className={styles.posts}>{posts}</span>}
      </div>
      <div className={styles.trendingIcon}>
        <MoreHorizontal />
      </div>
    </div>
  );
}

export default Sidebar;
