import { GetStaticProps } from 'next';
import { FiCalendar, FiUser  } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../../date';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home( { postsPagination }: HomeProps) {
  const [ nextPage, setNextPage ] = useState(postsPagination.next_page)

    const formattedPosts = postsPagination.results.map( post => {
      return {
        ...post,
        first_publication_date: formatDate(post.first_publication_date),
      }
    })

    const [ posts, setPosts ] = useState<Post[]>(formattedPosts)

    async function HandleLoadMorePost() {
      const newPostPagination = await fetch(nextPage).then(
        response => response.json()
      )

      setNextPage(newPostPagination.next_page)

      const newFormattedPost = newPostPagination.results.map( post => {
        return {
          ...post,
          first_publication_date: formatDate(post.first_publication_date)
        }
      })

      setPosts([...posts, ...newFormattedPost])
    }



  return (
    <div className={commonStyles.container}>
      {posts.map( post => (
        <div className={styles.content} key={post.uid}>
        <a href={`/post/${post.uid}`}>{post.data.title}</a>
        <p>{post.data.subtitle}</p>
        <div className={styles.info}>
          <div className={styles.infoContent}>
            <FiCalendar />
            <p> {post.first_publication_date}</p>
          </div>
          <div className={styles.infoContent}>
            <FiUser />
            <p>{post.data.author}</p>
          </div>
        </div>
      </div>
      ))}
      {nextPage && (
        <button type="button" onClick={HandleLoadMorePost}>
          Carregar mais posts
        </button>
      )}

    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    pageSize: 3,
  });

  const posts = postsResponse.results.map( post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author

      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts
  }

  return {
    props: {
      postsPagination
    }
  }
};
