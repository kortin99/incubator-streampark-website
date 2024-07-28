import React from 'react';
import clsx from 'clsx';

import './styles.less';
import { useDOMVisibilityChange } from '@site/src/hooks/useDomVisibilityChange';
import { useCacheStorage } from '@site/src/hooks/useCacheStorage';

interface AchievementBannerProps {
  className?: string;
}

export default function AchievementBanner(props: AchievementBannerProps) {
  const [githubState, setGitHubState] = React.useState({
    stars: 3710,
    forks: 963,
    downloads: 9900,
  });

  const cacheStorage = useCacheStorage<{
    stars: number;
    forks: number;
    downloads: number;
  }>();

  function startAnimation() {
    const { stars, forks, downloads } = githubState;
    console.log('stars: ', stars);

    numberIncrementAnimation(stars, {
      callback: (current) => {
        setGitHubState((state) => ({
          ...state,
          stars: current,
        }));
      },
    });
    numberIncrementAnimation(forks, {
      callback: (current) => {
        setGitHubState((state) => ({
          ...state,
          forks: current,
        }));
      },
    });
    numberIncrementAnimation(downloads, {
      callback: (current) => {
        setGitHubState((state) => ({
          ...state,
          downloads: current,
        }));
      },
    });
  }

  function cacheGithubState() {
    setTimeout(() => {
      cacheStorage.setItem('sp-github-state', githubState);
    }, 500);
  }

  function fetchGithubState() {
    fetch('https://api.github.com/repos/apache/incubator-streampark')
      .then((res) => res.json())
      .then((data) => {
        setGitHubState((state) => ({
          ...state,
          stars: data.stargazers_count,
          forks: data.forks_count,
        }));
        cacheGithubState();
      });

    fetch('https://api.github.com/repos/apache/incubator-streampark/releases')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        let totalDownloads = 0;
        for (let i = 0; i < data.length; ++i) {
          for (let j = 0; j < data[i].assets.length; ++j) {
            totalDownloads += data[i].assets[j].download_count;
          }
        }

        setGitHubState((state) => ({
          ...state,
          downloads: totalDownloads,
        }));

        cacheGithubState();
      });
  }

  React.useEffect(() => {
    const cached = cacheStorage.getItem('sp-github-state');
    console.log('githubState: ', cached);
    if (cached) {
      setGitHubState(cached);
    } else {
      fetchGithubState();
    }
  }, []);

  const containerRef = React.useRef<HTMLDivElement>();

  // useDOMVisibilityChange(containerRef.current, {
  //   onChange: (visible) => {
  //     if (visible) {
  //       startAnimation()
  //     }
  //   }
  // })

  return (
    <section
      ref={containerRef}
      className={clsx('achievement-banner', props.className)}
      data-aos="fade-up"
    >
      <div className="achievement-banner-item">
        <div className="achievement-banner-item__highlight">
          {formatNumber(githubState.stars)}
        </div>
        <div>Github stars</div>
      </div>
      <div className="achievement-banner-item">
        <div className="achievement-banner-item__highlight">
          {formatNumber(githubState.forks)}
        </div>
        <div>Github forks</div>
      </div>
      <div className="achievement-banner-item">
        <div className="achievement-banner-item__highlight">
          {formatNumber(githubState.downloads)}
        </div>
        <div>Total downloads</div>
      </div>
    </section>
  );
}

function formatNumber(num: number) {
  if (num < 1000) {
    return num;
  } else if (num < 1000_000) {
    return (num / 1000).toFixed(1) + 'k+';
  } else {
    return (num / 1000_000).toFixed(1) + 'm+';
  }
}

function numberIncrementAnimation(
  end = 0,
  { start = 0, duration = 1000, rate = 50, callback = undefined } = {},
) {
  const step = ((end - start) / duration) * rate;
  let current = start;
  const timer = setInterval(() => {
    current += parseInt(step.toFixed(0));
    if (current >= end) {
      clearInterval(timer);
      current = end;
    }
    callback(current);
  }, rate);
  if (typeof callback === 'function') {
    callback(current);
  }
  return current;
}