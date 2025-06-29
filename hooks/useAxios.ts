//import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';

import { authenticatedAtom } from '@/atoms/authAtom';
//import { blockedAtom } from '@/atoms/blockedAtom';

type AxiosTypes = 'users' | 'progress' | 'food' | 'group';

export const intervals: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>();

const getURL = (type: AxiosTypes): string => {
  switch (type) {
    case 'users':
      return `${process.env.EXPO_PUBLIC_USER_SERVICE_URL}`;
    case 'progress':
      return `${process.env.EXPO_PUBLIC_PROGRESS_SERVICE_URL}`;
    case 'food':
      return `${process.env.EXPO_PUBLIC_FOOD_SERVICE_URL}`;
    case 'group':
      return `${process.env.EXPO_PUBLIC_GROUP_SERVICE_URL}`;
    default:
      return '';
  }
};

export default function useAxiosInstance(type: AxiosTypes) {
  const token = useAtomValue(authenticatedAtom)?.token;
  const setAuth = useSetAtom(authenticatedAtom);
  // const setBlocked = useSetAtom(blockedAtom);
  const router = useRouter();

  //   function HandleBlock() {
  //     AsyncStorage.removeItem('auth');
  //     setAuth(null);
  //     router.replace('/front-page');
  //   }

  const instance = axios.create({
    timeout: 10000,
    headers: { Authorization: `Bearer ${token}` },
    baseURL: getURL(type)
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.status === 403) {
        //setBlocked(true);
        intervals.forEach((v) => {
          clearInterval(v);
        });
        intervals.clear();
        console.log('post clear: ', intervals);
        //HandleBlock();
      }

      //console.error(error.response.data);

      return Promise.reject(error);
    }
  );

  return instance;
}
