<template>
    <div>
        <HeroSection />
        <VideoSection />
        <HowItWorksSection />
        <WhyInvestSection />
        <section id="geoai" class="bg-[linear-gradient(180deg,#eef6ef_0%,#f8faf6_100%)] py-20">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="grid gap-8 overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_20px_60px_rgba(76,88,56,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
                    <div class="relative p-8 sm:p-12">
                        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">{{ $t('home.geoai.badge') }}</p>
                        <h2 class="mt-4 text-3xl font-semibold text-stone-900 sm:text-4xl">
                            {{ $t('home.geoai.title') }}
                        </h2>
                        <p class="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
                            {{ $t('home.geoai.description') }}
                        </p>
                        <div class="mt-8 flex flex-wrap gap-3">
                            <router-link
                                to="/geoai"
                                class="rounded-full bg-emerald-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-800"
                            >
                                {{ $t('home.geoai.button') }}
                            </router-link>
                            <a
                                href="#geoai"
                                class="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                            >
                                {{ $t('home.geoai.scrollToService') }}
                            </a>
                        </div>
                    </div>
                    <div class="relative flex items-stretch bg-[linear-gradient(160deg,#114b2f_0%,#1f6b43_45%,#74a65c_100%)] p-8 sm:p-12">
                        <div class="grid gap-4">
                            <div class="rounded-3xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
                                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">{{ $t('home.geoai.steps.step1') }}</p>
                                <p class="mt-2 text-lg font-semibold">{{ $t('home.geoai.steps.pickPoint') }}</p>
                                <p class="mt-2 text-sm leading-6 text-white/80">{{ $t('home.geoai.steps.pickPointDesc') }}</p>
                            </div>
                            <div class="rounded-3xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
                                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">{{ $t('home.geoai.steps.step2') }}</p>
                                <p class="mt-2 text-lg font-semibold">{{ $t('home.geoai.steps.readRecommendation') }}</p>
                                <p class="mt-2 text-sm leading-6 text-white/80">{{ $t('home.geoai.steps.readRecommendationDesc') }}</p>
                            </div>
                            <div class="rounded-3xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
                                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">{{ $t('home.geoai.steps.step3') }}</p>
                                <p class="mt-2 text-lg font-semibold">{{ $t('home.geoai.steps.unlockRest') }}</p>
                                <p class="mt-2 text-sm leading-6 text-white/80">{{ $t('home.geoai.steps.unlockRestDesc') }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import HeroSection from '../components/HeroSection.vue'
import VideoSection from '../components/VideoSection.vue'
import HowItWorksSection from '../components/HowItWorksSection.vue'
import WhyInvestSection from '../components/WhyInvestSection.vue'

export default {
    name: "Home",
    components: {
        HeroSection,
        VideoSection,
        HowItWorksSection,
        WhyInvestSection
    }
}
</script>

<style scoped>
.wave-separator {
    position: relative;
    width: 100%;
    height: 150px;
    overflow: hidden;
    line-height: 0;
    transform: rotate(180deg);
}

.wave-separator svg {
    position: relative;
    display: block;
    width: calc(100% + 1.3px);
    height: 150px;
}

.wave-separator .shape-fill {
    fill: #F9FAFB;
}

.hero-content {
    opacity: 0;
    animation: fadeIn 1s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.animate-slide-up {
    opacity: 0;
    transform: translateY(20px);
    animation: slideUp 0.8s ease-out forwards;
}

.animate-slide-up-delay-1 {
    opacity: 0;
    transform: translateY(20px);
    animation: slideUp 0.8s ease-out 0.2s forwards;
}

.animate-slide-up-delay-2 {
    opacity: 0;
    transform: translateY(20px);
    animation: slideUp 0.8s ease-out 0.4s forwards;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.curved-separator {
    position: relative;
    height: 150px;
    margin-top: -150px;
    z-index: 1;
    pointer-events: none;
}

.curve {
    position: absolute;
    height: 250px;
    width: 100%;
    bottom: 0;
    text-align: center;
}

.curve::before {
    content: '';
    display: block;
    position: absolute;
    border-radius: 100% 50%;
    width: 55%;
    height: 100%;
    background-color: white;
    transform: translate(85%, 60%);
}

.curve::after {
    content: '';
    display: block;
    position: absolute;
    border-radius: 100% 50%;
    width: 55%;
    height: 100%;
    background-color: white;
    transform: translate(-4%, 40%);
    z-index: -1;
}

.half-circle-separator {
    position: relative;
    height: 150px;
    margin-top: -150px;
    overflow: hidden;
}

.half-circle {
    position: absolute;
    bottom: -50%;
    left: -50%;
    right: -50%;
    height: 300px;
    background-color: white;
    border-radius: 50%;
}

.card-shadow {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(0, 0, 0, 0.05);
}

.investment-reason {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
