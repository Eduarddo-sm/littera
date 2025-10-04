import {supabase} from './supabase';

const userName = document.getElementById('user-name') as HTMLHeadingElement | null;
const userFullName = document.getElementById('user-fullname') as HTMLDivElement | null;
const userEmail = document.getElementById('user-email') as HTMLDivElement | null;
const userPhone = document.getElementById('user-phone') as HTMLDivElement | null;
const userBio = document.getElementById('user-bio') as HTMLDivElement | null;


async function loadUserData() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
        window.location.href = "../pages/login/login.html";
        return;
    }

    const {data: profile} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
}

// const userName = document.getElementById('user-name') as HTMLHeadingElement | null;
// const userFullName = document.getElementById('user-fullname') as HTMLDivElement | null;
// const userEmail = document.getElementById('user-email') as HTMLDivElement | null;
// const userPhone = document.getElementById('user-phone') as HTMLDivElement | null;
// const userBio = document.getElementById('user-bio') as HTMLDivElement | null;

if (userName) userName.innerText = `${profile?.name}`;

loadUserData();